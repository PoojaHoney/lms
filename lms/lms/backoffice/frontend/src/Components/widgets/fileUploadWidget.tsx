import { Row, Upload, Button, Spin, Image } from "antd";
import { useContext, useEffect, useState } from "react";
// import { GetFileUrl } from "../../util/common";
import { BsPlusSquareFill } from "react-icons/bs";
import { CloseCircleOutlined } from "@ant-design/icons";
import "./fileUploadWidget.css";
// import { useNotification } from "@refinedev/core";
import { FileTextOutlined } from "@ant-design/icons";
import { GetFileUrl } from "../../utils/common";
import ErrorBoundary from "../../utils/ErrorBoundaries";
// import ErrorBoundary from "../../modules/error/ErrorBoundaries";
// import { EntityContext } from "../../contexts/entityContext";

const FileUploadWidget = (props: any) => {
  const [dataSource, setDataSource] = useState<any>([]);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  // const [entity] = useContext(EntityContext); //entity <=> Module
  // const { open } = useNotification();
  const imageTypes: any = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/vnd.microsoft.icon",
  ];
  useEffect(() => {
    if (props?.value !== undefined || props?.value?.length > 0) {
      setDataSource(props?.value);
    }
  }, []);

  useEffect(() => {
    dataSource.length > 0 &&  props?.onChange?.(dataSource);
  }, [dataSource]);

  const handleUpload = async (event: any, module: any) => {
    setLoadingIndex(true);
    if (event.file.percent == 100) {
      let fileTypeList = props?.options?.map((item: any) => item.type);
      if (!fileTypeList.includes(event.file.type)) {
        setLoadingIndex(false);
        // open?.({
        //   type: "error",
        //   message: "Error uploading",
        //   description: `Unable to upload file!`,
        // });
        return Promise.reject(new Error(`Error uploading file`));
      }
      setUploadError(false);
      await GetFileUrl(event.file.originFileObj, event.file.type, module).then(
        (res) => {
          if (res == 404) {
            return setUploadError(true);
          }
          let fileType = imageTypes.includes(event?.file?.type)
            ? "image"
            : "file";
          let data = {
            name: event.file.name,
            path: res,
            type: fileType,
          };
          setDataSource([...dataSource, data]);
          setLoadingIndex(false);
        }
      );
    }
  };

  const uploadFile = async ({ onSuccess, file }: any) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const handleRemoveFile = (item: any, index: number) => {
    let data = [...dataSource];
    data.splice(index, 1);
    setDataSource(data);
  };

  const handleFiles = (data: any) => {
    if (data?.length > 0) {
      return data.map((item: any, index: number) => {
        return (
          <div className="file_container">
            <CloseCircleOutlined
              className="cross-postion"
              onClick={() => handleRemoveFile(item, index)}
            />
            {item?.type === "image" ? (
              <Image
                src={item?.path}
                alt="img"
                key={index}
                height={35}
                width={60}
              />
            ) : (
              <>
                <FileTextOutlined />
                <div>{item?.name}</div>
              </>
            )}
          </div>
        );
      });
    }
    return "";
  };

  return (
    <ErrorBoundary>
      <Row>
        <div className="main-container">
          <div className="upload-file-container">
            {handleFiles(dataSource)}
            {uploadError && (
              <p className="upload-button-container-padding">
                Unable to Upload Files
              </p>
            )}
            <Upload
              onChange={(e: any) => {
                handleUpload(e, "");
              }}
              customRequest={uploadFile}
              className="upload-button-container-padding"
            >
              {loadingIndex ? (
                <div className="file-spinner">
                  <Spin size="small" tip="Loading" />
                </div>
              ) : /*Condition for singleFileUpload */ props?.singleFileUpload &&
                dataSource.length >= 1 ? (
                ""
              ) : (
                <Button
                  className="upload-button"
                  icon={<BsPlusSquareFill />}
                >Add New Attachment </Button>
              )}
            </Upload>
          </div>
        </div>
      </Row>
    </ErrorBoundary>
  );
};
export default FileUploadWidget;
