import { Layout } from '../../../components/Layout';
import { OfficeProfile } from '../../../views/OfficeProfile';

export default async function OfficeProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Layout>
      <OfficeProfile officeId={params.id} />
    </Layout>
  );
}
