export const setSeo = (title: string, description: string) => {
  document.title = title;

  const ensureMeta = (selector: string, attr: 'name' | 'property', key: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    return element;
  };

  ensureMeta('meta[name="description"]', 'name', 'description').content = description;
  ensureMeta('meta[property="og:title"]', 'property', 'og:title').content = title;
  ensureMeta('meta[property="og:description"]', 'property', 'og:description').content = description;
  ensureMeta('meta[property="og:type"]', 'property', 'og:type').content = 'website';
};
