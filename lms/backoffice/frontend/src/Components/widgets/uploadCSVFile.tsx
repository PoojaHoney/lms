// import { useNotification } from "@refinedev/core";
import { Button, Modal, Upload, UploadProps, Space, Tag } from "antd";
// import { fetchData, uploadCSVFileHandler } from "../../util/common";
import { useContext, useState } from "react";
import {
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import "./uploadCSV.css";
import { fetchData, uploadCSVFileHandler } from "../../utils/common";
// import { VideoContext } from "../../contexts/videoContext";

const { Dragger } = Upload;

const UploadCSVFile = (props: any) => {
  // const { open } = useNotification();
  // const [loadPage, setLoadPage] = useState<any>(false);
  // const [videoState] = useContext(VideoContext);
  const [invalidData, setInvalidData] = useState("");
  const [showModal, setShowModal] = useState<any>(false);
  // const selectID: any = videoState?.selectedItemId;
   const selectID: any = "";
  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setInvalidData("");
      const isCSV = file.type === "text/csv";
      if (!isCSV) {
        // open?.({
        //   type: "error",
        //   message: "Upload File Error",
        //   description: `You can only upload CSV file!`,
        // });
      } else {
        uploadCSVFileHandler(file, selectID, props.module).then((res: any) => {
          if (res.status === 200 && res?.data?.data) {
            fetchUpdatedEvents(props.siteID, props.module, props.langValue);
            // setLoadPage(false);
            setShowModal(false);
            // open?.({
            //   type: "success",
            //   message: res.data.data,
            //   description: "Upload event Success",
            // });
          } else {
            setInvalidData(res.data);
            fetchUpdatedEvents(props.siteID, props.module, props.langValue);
          }
        });
      }
      // return isCSV || Upload.LIST_IGNORE;
    },
    onChange: (event: any) => {
      //
    },
    customRequest: async ({ onSuccess, file }: any) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    maxCount: 1,
  };
  const handleTemplateCSV = () => {
    const link = document.createElement("a");
    link.href = "template.csv";
    link.download = "template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchUpdatedEvents = async (siteID: any, module: any, lang: any) => {
    const CONTENT_API_URL: any = process.env.REACT_APP_CONTENT_API;
    const FETCH_URL = `${CONTENT_API_URL}/${siteID}/${module}/${selectID}/${lang}`;
    let response = await fetchData(FETCH_URL);
    let updatedEvents = response.calendar;
    props.setInitialEvents(updatedEvents);
    props.onChange(updatedEvents);
  };

  const generateCSV = (data: any) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(new Blob([data]));
    downloadLink.setAttribute("download", "data.csv");
    downloadLink.click();
    window.URL.revokeObjectURL(downloadLink.href);
    downloadLink.remove();
  };
  return (
    <div className="upload_container">
      <Space className="csv_button_container">
        <Button className="uploadButton" onClick={handleTemplateCSV}>
          <DownloadOutlined />
          <span>Sample CSV</span>
        </Button>
        <Button
          className="uploadButton"
          onClick={() => {
            setShowModal(() => true);
          }}>
          <UploadOutlined />
          <span>Upload CSV</span>
        </Button>
      </Space>
      <Modal
        title={invalidData ? "Event Conflicts Occured" : "Upload CSV File"}
        footer={null}
        open={showModal}
        onOk={() => {
          setShowModal(() => false);
          setInvalidData("");
        }}
        className="listdeletemodal"
        onCancel={() => {
          setShowModal(() => false);
          setInvalidData("");
        }}
        cancelButtonProps={{ disabled: false }}>
        {/* {loadPage && <div>loading</div>} */}
        {invalidData ? (
          <div>
            <p>
              There's a conflict with your events data or the content lacks
              necessary rights.
            </p>
            <p>
              <span>To update the correct events, </span>
              <Tag color="#26a4de">
                <a
                  onClick={() => {
                    generateCSV(invalidData);
                    setShowModal(false);
                    setInvalidData("");
                  }}>
                  Click here
                </a>
              </Tag>
              <span>to download the file.</span>
            </p>
          </div>
        ) : (
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single file upload only.
            </p>
          </Dragger>
        )}
      </Modal>
    </div>
  );
};

export default UploadCSVFile;
