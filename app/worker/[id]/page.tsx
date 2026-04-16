import { Layout } from '../../../components/Layout';
import { WorkerProfile } from '../../../views/WorkerProfile';

export default async function WorkerProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Layout>
      <WorkerProfile workerId={params.id} />
    </Layout>
  );
}
