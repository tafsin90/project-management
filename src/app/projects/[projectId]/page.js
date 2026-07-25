import Layout from '../../../views/Layout';
import ProjectDetails from '../../../views/ProjectDetails';

export default async function ProjectDetailsPage({ params, searchParams }) {
  const { projectId } = await params;
  const { tab = 'tasks' } = await searchParams;
  return (
    <Layout>
      <ProjectDetails projectId={projectId} tab={tab} />
    </Layout>
  );
}
