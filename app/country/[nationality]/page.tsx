import { Layout } from '../../../components/Layout';
import { CountryResults } from '../../../views/CountryResults';

export default async function CountryResultsPage(props: { params: Promise<{ nationality: string }> }) {
  const params = await props.params;
  return (
    <Layout>
      <CountryResults nationality={decodeURIComponent(params.nationality)} />
    </Layout>
  );
}
