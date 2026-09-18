import { Component } from 'react';
import { ServerCrash } from 'lucide-react';
import translations from '../data/translations';
import ErrorLayout from '../pages/errors/ErrorLayout';

const get = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

function stringsFor(lang) {
  const dict = translations[lang] || translations.en;
  const pick = (path) => get(dict, path) ?? get(translations.en, path) ?? path;
  return {
    eyebrow: pick('error.server.eyebrow'),
    title: pick('error.server.title'),
    desc: pick('error.server.desc'),
    hint: pick('error.server.hint'),
    retry: pick('error.retry'),
    home: pick('error.home'),
  };
}

function CrashFallback({ onReset }) {
  const lang = localStorage.getItem('nirovveda_lang') || 'en';
  const s = stringsFor(lang);
  return (
    <ErrorLayout
      code="500"
      eyebrow={s.eyebrow}
      title={s.title}
      description={s.desc}
      icon={ServerCrash}
      accent="red"
      hint={s.hint}
    >
      <button
        type="button"
        className="btn-primary"
        onClick={() => { onReset(); window.location.reload(); }}
      >
        {s.retry}
      </button>
      <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
        {s.home}
      </a>
    </ErrorLayout>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Uncaught UI error:', error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return <CrashFallback onReset={this.reset} />;
    return this.props.children;
  }
}
