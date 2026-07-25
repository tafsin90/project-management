import Layout from '../../../../views/Layout';
import TaskDetails from '../../../../views/TaskDetails';

export default async function TaskDetailsPage({ params }) {
  const { projectId, taskId } = await params;
  return (
    <Layout>
      <TaskDetails projectId={projectId} taskId={taskId} />
    </Layout>
  );
}
