<?php
/**
 * Shared contact form handler for quranmajeed.com and pakdata.com.
 *
 * - Each site has its own reCAPTCHA v2 key. The request's "site" field picks the
 *   site ("quranmajeed" when missing, so the Quran Majeed website works unchanged).
 *   Secret keys live in ../private/secrets.php.
 * - Replies with JSON when the request sends "Accept: application/json"
 *   (the websites' fetch calls); otherwise redirects back with ?status=...
 *   so a plain HTML form post still works.
 * - Recipients are set per site and per form (see SITES below).
 */

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const MAIL_FROM = 'no-reply@pakdata.com';
const DEFAULT_SITE = 'quranmajeed';

// Forms sent from a local dev server go only to this address, for every site and form.
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const LOCAL_RECIPIENTS = [
    'to' => 'anas.zubair@pakdata.com',
    'cc' => [],
];

// Per site:
// - origins: sites allowed to call this endpoint from the browser.
// - hosts: hosts allowed as redirect targets, and hostnames Google may report
//   for a solved reCAPTCHA. Remove the local ones if the key does not allow localhost.
// - recipients: per form type. 'contact' is the default for every site.
const SITES = [
    'quranmajeed' => [
        'fromName' => 'Quran Majeed Website',
        'defaultSubject' => 'Quran Majeed Contact',
        'fallbackRedirect' => 'https://quranmajeed.com/contact/',
        'origins' => [
            'https://quranmajeed.com',
            'https://www.quranmajeed.com',
            'https://quranmajeed-web.vercel.app', // staging
            'http://localhost:4321',
            'http://127.0.0.1:4321',
        ],
        'hosts' => [
            'quranmajeed.com',
            'www.quranmajeed.com',
            'quranmajeed-web.vercel.app', // staging
            'localhost',
            '127.0.0.1',
        ],
        'recipients' => [
            'contact' => [
                'to' => 'support@pakdata.com',
                'cc' => [],
            ],
            'advertise' => [
                'to' => 'hasan@pakdata.com',
                'cc' => ['arif@pakdata.com', 'affan.sheikh@pakdata.com'],
            ],
        ],
    ],
    'pakdata' => [
        'fromName' => 'Pakdata Website',
        'defaultSubject' => 'Pakdata Contact',
        'fallbackRedirect' => 'https://pakdata.com/contact-us',
        'origins' => [
            'https://pakdata.com',
            'https://www.pakdata.com',
            'http://localhost:4321',
            'http://127.0.0.1:4321',
        ],
        'hosts' => [
            'pakdata.com',
            'www.pakdata.com',
            'localhost',
            '127.0.0.1',
        ],
        'recipients' => [
            // Contact, support and development services forms.
            'contact' => [
                'to' => 'support@pakdata.com',
                'cc' => [],
            ],
            // Join Us (job-us) form.
            'career' => [
                'to' => 'careers@pakdata.com',
                'cc' => [],
            ],
        ],
    ],
];

// reCAPTCHA tokens are often over 1000 characters; never cut them.
const MAX_LENGTHS = [
    'name' => 120,
    'email' => 254,
    'subject' => 200,
    'subjectPrefix' => 120,
    'details' => 2000,
    'message' => 10000,
    'g-recaptcha-response' => 10000,
];

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

// A preflight request has no body, so allow any origin that belongs to a known site.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_merge(...array_values(array_map(fn ($site) => $site['origins'], SITES)));
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

/** Single-line text for mail headers: no line breaks or control characters. */
function headerSafe(string $value): string
{
    return trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '');
}

/** Multi-line text for the mail body: keeps line breaks, drops other control characters. */
function bodySafe(string $value): string
{
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '');
}

function field(array $data, string $key, string $default = ''): string
{
    $value = $data[$key] ?? $default;
    $value = is_string($value) ? $value : $default;
    $max = MAX_LENGTHS[$key] ?? 1000;
    $value = trim($value);
    // mbstring is optional on some hosts; fall back to a UTF-8 safe regex cut.
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max, 'UTF-8');
    }
    return preg_match('/^.{0,' . $max . '}/us', $value, $match) ? $match[0] : substr($value, 0, $max);
}

/** Key of the site that sent the request. Unknown values fall back to DEFAULT_SITE. */
function siteKey(array $data): string
{
    $key = field($data, 'site');
    return isset(SITES[$key]) ? $key : DEFAULT_SITE;
}

function redirectTarget(array $data): string
{
    $site = SITES[siteKey($data)];
    $url = $data['redirectUrl'] ?? ($_SERVER['HTTP_REFERER'] ?? $site['fallbackRedirect']);
    $host = is_string($url) ? (parse_url($url, PHP_URL_HOST) ?? '') : '';
    return in_array($host, $site['hosts'], true) ? $url : $site['fallbackRedirect'];
}

/**
 * Which form sent the request: 'advertise', 'career' or 'contact'.
 * The subjectPrefix checks cover pages that do not send formType.
 */
function formType(array $data): string
{
    $formType = field($data, 'formType');
    $prefix = field($data, 'subjectPrefix');
    if ($formType === 'advertise' || $prefix === 'Quran Majeed Advertising Quote') {
        return 'advertise';
    }
    if ($formType === 'career' || $prefix === 'Career') {
        return 'career';
    }
    return 'contact';
}

/** Ends the request: JSON for fetch calls, a redirect for plain form posts. */
function respond(int $httpStatus, string $status, string $message, array $data = [], array $extra = []): void
{
    global $wantsJson;

    if ($wantsJson) {
        http_response_code($httpStatus);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['status' => $status, 'message' => $message] + $extra);
        exit();
    }

    $url = redirectTarget($data);
    $separator = parse_url($url, PHP_URL_QUERY) ? '&' : '?';
    header('Location: ' . $url . $separator . 'status=' . urlencode($status));
    exit();
}

/**
 * Asks Google whether the token is valid for this site.
 * Returns '' when it passes, or a short reason code when it fails. The codes
 * are Google's own (for example "invalid-input-secret") and contain no secrets.
 * $hostname receives the host where Google saw the reCAPTCHA solved.
 */
function verifyRecaptcha(string $secret, string $token, array $allowedHostnames, string &$hostname = ''): string
{
    $fields = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);

    $raw = false;
    $transportError = '';
    if (function_exists('curl_init')) {
        $curl = curl_init('https://www.google.com/recaptcha/api/siteverify');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $fields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $raw = curl_exec($curl);
        if ($raw === false) {
            $transportError = 'curl: ' . curl_error($curl);
        }
        curl_close($curl);
    } else {
        $raw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => $fields,
                'timeout' => 10,
            ],
        ]));
        if ($raw === false) {
            $transportError = 'http: could not reach Google (allow_url_fopen off or network blocked)';
        }
    }

    if ($transportError !== '') {
        error_log('mail-service: reCAPTCHA ' . $transportError);
        return 'verify-request-failed';
    }

    $result = json_decode((string) $raw, true);
    if (!is_array($result)) {
        error_log('mail-service: reCAPTCHA unreadable reply: ' . substr((string) $raw, 0, 200));
        return 'verify-bad-reply';
    }

    if (empty($result['success'])) {
        $codes = implode(',', (array) ($result['error-codes'] ?? ['unknown']));
        error_log('mail-service: reCAPTCHA failed: ' . $codes);
        return $codes;
    }

    $hostname = (string) ($result['hostname'] ?? '');
    if (!in_array($hostname, $allowedHostnames, true)) {
        error_log('mail-service: reCAPTCHA hostname not allowed: ' . $hostname);
        return 'hostname-not-allowed:' . preg_replace('/[^a-z0-9.\-]/i', '', $hostname);
    }

    return '';
}

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    exit();
}

$data = $_POST;
if (empty($data)) {
    $json = json_decode(file_get_contents('php://input') ?: '', true);
    if (is_array($json)) {
        $data = $json;
    }
}

$siteKey = siteKey($data);
$site = SITES[$siteKey];

// Honeypot: real visitors never fill this hidden field. Pretend success.
if (field($data, 'website') !== '') {
    respond(200, 'success', 'Thank you. Your message has been sent.', $data);
}

// Security check. Fails closed: no secret or no token means no email.
// secrets.php holds one secret per site in 'recaptcha_secrets'. The older
// single 'recaptcha_secret' entry still works for Quran Majeed.
$secretsFile = __DIR__ . '/../private/secrets.php';
$secrets = is_readable($secretsFile) ? require $secretsFile : [];
$recaptchaSecret = '';
if (is_array($secrets)) {
    $recaptchaSecret = $secrets['recaptcha_secrets'][$siteKey]
        ?? ($siteKey === 'quranmajeed' ? ($secrets['recaptcha_secret'] ?? '') : '');
}

if (!is_string($recaptchaSecret) || $recaptchaSecret === '' || strpos($recaptchaSecret, 'PASTE_') === 0) {
    error_log("mail-service: reCAPTCHA secret for '{$siteKey}' is missing in {$secretsFile}");
    respond(500, 'error', 'The mail service is not configured. Please email support@pakdata.com.', $data);
}

$token = field($data, 'g-recaptcha-response');
$recaptchaHostname = '';
$recaptchaFailure = $token === ''
    ? 'missing-input-response'
    : verifyRecaptcha($recaptchaSecret, $token, $site['hosts'], $recaptchaHostname);
if ($recaptchaFailure !== '') {
    respond(400, 'error', 'Security check failed. Please tick "I\'m not a robot" and try again.', $data, [
        'reason' => $recaptchaFailure,
    ]);
}

// Fields
$name = headerSafe(field($data, 'name'));
$email = field($data, 'email');
$message = bodySafe(field($data, 'message'));
// Optional "Label: value" lines (inquiry type, app, position...), shown above the message.
$details = bodySafe(field($data, 'details'));

// Older pages put those lines at the top of the message, followed by a blank line.
// Move them into $details so the email reads the same for every form.
if ($details === '' && preg_match('/^((?:[^\n:]{1,40}: [^\n]*\n)+)\n(.*)$/su', $message, $parts)) {
    $details = trim($parts[1]);
    $message = trim($parts[2]);
}
$subjectText = headerSafe(field($data, 'subject', $site['defaultSubject'])) ?: $site['defaultSubject'];
$subjectPrefix = headerSafe(field($data, 'subjectPrefix', 'Website Contact')) ?: 'Website Contact';

if ($name === '' || $email === '' || $message === '') {
    respond(400, 'error', 'Please fill in your name, email and message.', $data);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, 'error', 'Please enter a valid email address.', $data);
}

// Mail
// The hostname comes from Google, so a request cannot fake a local test to change recipients.
$recipients = in_array($recaptchaHostname, LOCAL_HOSTS, true)
    ? LOCAL_RECIPIENTS
    : ($site['recipients'][formType($data)] ?? $site['recipients']['contact']);

$subject = '=?UTF-8?B?' . base64_encode($subjectPrefix . ' - ' . $subjectText) . '?=';

$body = "Name: {$name}\n"
    . "Email: {$email}\n"
    . ($details !== '' ? "{$details}\n\n" : '')
    . "Message:\n{$message}\n\n"
    . "-------------------------\n"
    . 'Sent from: ' . headerSafe((string) (parse_url(redirectTarget($data), PHP_URL_HOST) ?? '')) . "\n";

$headers = 'From: ' . $site['fromName'] . ' <' . MAIL_FROM . ">\r\n"
    . ($recipients['cc'] ? 'Cc: ' . implode(', ', $recipients['cc']) . "\r\n" : '')
    . "Reply-To: {$email}\r\n"
    . "MIME-Version: 1.0\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($recipients['to'], $subject, $body, $headers, '-f' . MAIL_FROM)) {
    respond(200, 'success', 'Thank you. Your message has been sent.', $data);
}

error_log('mail-service: mail() failed');
respond(500, 'error', 'Your message could not be sent. Please try again later.', $data);
