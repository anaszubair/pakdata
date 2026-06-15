import json

def update_lang(filepath, is_ur=False, is_ar=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Global replace of M+ in values for ur and ar
    if is_ur:
        for k, v in data.items():
            if isinstance(v, str) and 'M+' in v:
                data[k] = v.replace('M+', ' ملین+')
    elif is_ar:
        for k, v in data.items():
            if isinstance(v, str) and 'M+' in v:
                data[k] = v.replace('M+', ' مليون+')
                
    # Add new product card keys
    if is_ur:
        data["product.features.title"] = "اہم خصوصیات"
        data["product.downloads.label"] = "ڈاؤن لوڈز:"
        data["product.btn.details"] = "تفصیلات دیکھیں"
        data["product.btn.get"] = "ایپ حاصل کریں"
        data["home.products.qm.downloads"] = "50 ملین+"
        data["home.products.qp.downloads"] = "10 ملین+"
        data["home.products.qt.downloads"] = "5 ملین+"
        data["home.products.eu.downloads"] = "30 ملین+"
    elif is_ar:
        data["product.features.title"] = "الميزات الرئيسية"
        data["product.downloads.label"] = "التنزيلات:"
        data["product.btn.details"] = "عرض التفاصيل"
        data["product.btn.get"] = "احصل على التطبيق"
        data["home.products.qm.downloads"] = "50 مليون+"
        data["home.products.qp.downloads"] = "10 مليون+"
        data["home.products.qt.downloads"] = "5 مليون+"
        data["home.products.eu.downloads"] = "30 مليون+"
    else: # English
        data["product.features.title"] = "Key Features"
        data["product.downloads.label"] = "Downloads:"
        data["product.btn.details"] = "View Details"
        data["product.btn.get"] = "Get App"
        data["home.products.qm.downloads"] = "50M+"
        data["home.products.qp.downloads"] = "10M+"
        data["home.products.qt.downloads"] = "5M+"
        data["home.products.eu.downloads"] = "30M+"

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

update_lang('src/i18n/en.json')
update_lang('src/i18n/ur.json', is_ur=True)
update_lang('src/i18n/ar.json', is_ar=True)
print("JSON files updated")
