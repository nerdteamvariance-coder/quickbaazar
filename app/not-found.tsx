import './globals.css';
import { Empty } from '@/components/Empty';

export default function NotFound() {
  return <main className="wrap"><Empty title="Page not found" text="That link doesn’t go anywhere. Try the shop instead." cta="Back to home" href="/" /></main>;
}
