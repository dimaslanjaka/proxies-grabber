import { marked } from 'marked';

marked.use({
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

export default function markdown(str: string) {
  return marked.parse(str);
}
