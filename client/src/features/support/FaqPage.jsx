import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { fetchFaqs } from '../../components/services/faqService';
import { ROUTES } from '../../constants/routes';
import logger from '../../utils/logger';

function groupByCategory(items) {
  const map = new Map();
  for (const row of items) {
    const cat = row.category || 'General';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(row);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSlug, setOpenSlug] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchFaqs();
      setFaqs(rows);
    } catch (e) {
      logger.error('FAQ load failed', e?.message || e);
      setError('Could not load FAQs. Please try again later.');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => groupByCategory(faqs), [faqs]);

  const toggle = (slug) => {
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Home
        </Link>

        <div className="flex items-start gap-3 mb-8">
          <div className="rounded-xl bg-sky-100 p-3 text-sky-700">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently asked questions</h1>
            <p className="text-slate-600 mt-1">
              Answers are maintained by our team and loaded from our knowledge base. For personal help, visit{' '}
              <Link to={ROUTES.SUPPORT} className="text-sky-700 font-medium hover:underline">
                Support
              </Link>
              .
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading FAQs…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-900 px-4 py-3">{error}</div>
        ) : grouped.length === 0 ? (
          <p className="text-slate-500">No FAQs are published yet.</p>
        ) : (
          <div className="space-y-10">
            {grouped.map(([category, rows]) => (
              <section key={category}>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
                  {category}
                </h2>
                <ul className="space-y-2">
                  {rows.map((item) => {
                      const slugKey = item.slug || String(item.id);
                      const expanded = openSlug === slugKey;
                      return (
                        <li
                          key={slugKey}
                          className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggle(slugKey)}
                            className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 hover:bg-slate-50 transition"
                            aria-expanded={expanded}
                          >
                            <span className="font-medium text-slate-900">{item.question}</span>
                            <ChevronDown
                              className={`w-5 h-5 shrink-0 text-slate-500 transition-transform ${
                                expanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {expanded ? (
                            <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3 whitespace-pre-wrap">
                              {item.answer}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
