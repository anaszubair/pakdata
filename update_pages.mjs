import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages/[...lang]';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro'));

const pathsInjection = `
export function getStaticPaths() {
  return [
    { params: { lang: undefined } },
    { params: { lang: 'ur' } },
    { params: { lang: 'ar' } }
  ];
}
`;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace imports
  content = content.replace(/from\s+['"]\.\.\/layouts/g, "from '../../layouts");
  content = content.replace(/from\s+['"]\.\.\/components/g, "from '../../components");
  
  // Inject getStaticPaths
  if (!content.includes('getStaticPaths')) {
    content = content.replace(/^---\n/, `---\n${pathsInjection}`);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
