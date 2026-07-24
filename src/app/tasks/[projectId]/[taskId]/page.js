import Layout from '../../../../pages/Layout';
import TaskDetails from '../../../../pages/TaskDetails';

export default function TaskDetailsPage({ params }) {
  return (
    <Layout>
      <TaskDetails projectId={params.projectId} taskId={params.taskId} />
    </Layout>
  );
}
