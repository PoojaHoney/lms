import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
// import  axiosInstance  from "../../common/utils/axios";
import { Button, Image } from "antd";
import { Upload } from "antd/lib";
import React, { useEffect, useState } from "react";
import './styles.css';
import ErrorBoundary from "../../utils/ErrorBoundaries";
import axios from "axios";
import { authHeaders } from "../HomePage/AuthHeaders/AuthHeaders";
import { GetImageUrl } from "../../utils/common";



const ImageUploadWidget = (props: any) => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<any>([]);
    useEffect(() => {
        if (props?.value == undefined || props?.value.length == 0) {
            setDataSource([]);
        } else {
            setDataSource(props?.value);
        }
    }, [props.value]);
    const uploadImage = async ({ onSuccess, file }: any) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const handleUpload = async (event: any, index: number, module: any) => {
        if (event.file.status === "uploading") {
            setLoading(true);
        }
        if (event.file.status == "done") {
            GetImageUrl(event.file.originFileObj).then((res: any) => {
                let data = res?.filePath;
                setDataSource([...dataSource, data]);
                props?.onChange?.([...dataSource, data]);
                setLoading(false);
            });
        }
    };
    const handleShowImages = (data: any) => {
        if (data?.length > 0) {
            return (
                <div className="image_box" style={{ display: "flex", flexDirection: "row", gap: "10px", margin: "10px 0" }}>
                    {data.map((item: any, index: number) => {
                        return (
                            <div >
                                <Image
                                    src={item}
                                    alt="img"
                                    key={index}
                                    height={65}
                                    width={60}
                                />
                            </div>
                        );
                    })}
                </div>
            )
        }
        return "";
    };

    const uploadButton = (
        <div>{loading ? <LoadingOutlined /> : <PlusOutlined />}</div>
    );
    return (
        <ErrorBoundary>
            <div className="uploadImage_container">
                {handleShowImages(dataSource)}
                <Upload
                    name="avatar"
                    listType="text"
                    className="avatar-uploader"
                    customRequest={uploadImage}
                    showUploadList={false}
                    onChange={(e) => handleUpload(e, 1, "")}
                    maxCount={4}
                    multiple
                >
                    <Button disabled={dataSource.length > 3 ? true : false} >{uploadButton}</Button>
                </Upload>
            </div>
        </ErrorBoundary>
    );
};

export default ImageUploadWidget;