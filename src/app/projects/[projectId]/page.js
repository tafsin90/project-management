import Layout from '../../../pages/Layout';
import ProjectDetails from '../../../pages/ProjectDetails';

export default function ProjectDetailsPage({ params, searchParams }) {
  return (
    <Layout>
      <ProjectDetails projectId={params.projectId} tab={searchParams?.tab || 'tasks'} />
    </Layout>
  );
}
