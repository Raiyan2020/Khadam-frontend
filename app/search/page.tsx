import { Layout } from '../../components/Layout';
import { SearchResults } from '../../views/SearchResults';

export default async function SearchResultsPage(props: { searchParams: Promise<{ filterType?: string, category?: string, query?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <Layout>
      <SearchResults filterType={searchParams.filterType} category={searchParams.category} query={searchParams.query} />
    </Layout>
  );
}
