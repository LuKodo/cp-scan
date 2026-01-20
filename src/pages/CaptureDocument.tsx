import Layout from "../template/layout";
import PhotoCapture from "../components/PhotoCapture";

const CaptureDocument: React.FC = () => {
  return (
    <Layout>
      <PhotoCapture type={"formula"} />
    </Layout>
  );
};

export default CaptureDocument;
