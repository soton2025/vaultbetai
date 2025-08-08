import { Metadata } from 'next';
import ResultsClient from './components/ResultsClient';

export const metadata: Metadata = {
  title: 'Historical Results & Track Record | Vault Bets',
  description: 'View our complete track record of AI-powered sports analysis predictions. Filter by sport, odds range, and results with full transparency.',
  keywords: 'betting results, track record, sports predictions, AI accuracy, betting history',
};

export default function ResultsPage() {
  return <ResultsClient />;
}