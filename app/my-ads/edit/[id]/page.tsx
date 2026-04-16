import { Layout } from '../../../../components/Layout';
import { EditAd } from '../../../../views/EditAd';

export default async function EditAdPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Layout>
      <EditAd adId={params.id} />
    </Layout>
  );
}
