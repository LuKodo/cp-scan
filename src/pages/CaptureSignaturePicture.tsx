import Layout from "../template/layout";
import PhotoCapture from "../components/PhotoCapture";

const CaptureSignaturePicture: React.FC = () => {
  return (
    <Layout>
      <PhotoCapture type={"firma"} />
    </Layout>
  );
};

export default CaptureSignaturePicture;
