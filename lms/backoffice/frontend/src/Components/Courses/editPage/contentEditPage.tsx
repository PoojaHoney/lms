// // import { Button } from "antd";
// // import React from "react";
// import "./styles.css";

// import React from "react";
// import { Form, Button } from "antd";
// import FormBuilder from "antd-form-builder";

// const ContentEditPage = ({ setIsEdit }: any) => {
//     const [form] = Form.useForm();
//   const meta = {
//     fields: [
//       { key: "name", label: "Chapter Name" },
//       { key: "content", label: "Description" },
//     ],
//   };
//   const handleFinish = (values: any) => {
//     console.log('Submit: ', values)
//   }
//   return (
//     <div className="content_edit_page_container">
//       <div className="content_edit_mode">
//         <div>
//           <Form form={form} onFinish={handleFinish}>
//             <FormBuilder form={form} meta={meta} />
//           </Form>
//         </div>
//         <Button onClick={() => setIsEdit(false)}>Cancel</Button>
//       </div>
//     </div>
//   );
// };

// export default ContentEditPage;

import React, { useEffect, useState } from "react";
import "../styles.css";
import { FaRegEdit } from "react-icons/fa";

import { Button, Image, Input, Spin, Tag, notification } from "antd";
import ContentEditTab from "./contentEditTab";
import { CheckCircleFilled, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { authHeaders } from "../../HomePage/AuthHeaders/AuthHeaders";
import ErrorBoundary from "../../../utils/ErrorBoundaries";
import type { NotificationArgsProps } from 'antd';
import PlainEditor from "../../widgets/quillEditor";
import EditFields from "../viewPage/editFields";
const { TextArea } = Input;

const ContentEditPage = ({ chapterId, setIsEdit }: any) => {
  const [chapterData, setChapterData] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);
  let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;

  const [api, contextHolder] = notification.useNotification();
  type NotificationPlacement = NotificationArgsProps['placement'];
  const Context = React.createContext({ name: 'Default' });
  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: `Successfull`,
      description: <Context.Consumer>{({ name }) => `Successfully, updated`}</Context.Consumer>,
      placement,
    });
  };
  const fetchLessonItem = (chapterId: any, contentType: any) => {
    setLoading(true);
    axios
      .get(
        `${BASE_API_URL}/content/${contentType}/${chapterId}`,
        // {
        //   filter: {},
        //   search: "",
        // },
        authHeaders()
      )
      .then((res: any) => {
        let data = res.data.data;
        setChapterData(data);
        setLoading(false);
      })
      .catch((oError) => {
        console.log("oError");
      });
  };

  const postLessonItem = (values: any, chapterId: any, contentType: any) => {
    axios
      .put(
        `${BASE_API_URL}/content/${contentType}/${chapterId}`,
        values,
        authHeaders()
      )
      .then((res: any) => {
        let data = res.data.data;
        openNotification('topRight');
        // setChapterData(data);
        setLoading(false);
        setIsEdit(false);
      })
      .catch((oError) => {
        console.log("oError");
      });
  }

  useEffect(() => {
    fetchLessonItem(chapterId?.selectedId, chapterId?.contentType);
  }, [chapterId]);



  if (loading) {
    return (
      <div
        className="course_sideBar_spinner"
        style={{ display: "flex", flex: "1" }}
      >
        <Spin />
      </div>
    );
  } else
    return (
      <ErrorBoundary>
        <div className="content_edit_page_container">
          <div className="content_edit_page_box">
            <Tag color="cyan" style={{ marginTop: "1rem" }}>Chapter</Tag>
            <div className="content_edit_title_box">
              <TextArea rows={2} className="content_edit_title" value={chapterData?.name}
                onChange={(e: any) => {
                  let data: any = { ...chapterData };
                  data.name = e.target.value;
                  setChapterData(data);
                }}
              />
              {/* <div className="content_edit_title">{chapterData?.name}</div> */}
              <div className="content_edit_title_button_box">
                <Button onClick={() => {
                  postLessonItem(chapterData, chapterId?.selectedId, chapterId?.contentType);
                }}>
                  <span>Save </span>
                  <span>
                    <SaveOutlined />
                  </span>
                </Button>
                <Button onClick={() => setIsEdit(false)} danger>
                  Cancel
                </Button>
              </div>
            </div>
            <div className="content_edit_chapter_details">
              <div className="content_edit_video_box">
                {/* <Image src={chapterId?.coverImage} width={"100%"} height={200} /> */}
              </div>
              <EditFields chapterData={chapterData} setChapterData={setChapterData} />
              {/* <div className="content_edit_chapter_title">
                Content: 
              </div>  */}
            </div>
          </div>
          {/* <div className="content_edit_page_right_panel">
            <div className="content_edit_page_right_tab">
              <ContentEditTab chapterData={chapterData} setChapterData={setChapterData} />
            </div>
          </div> */}
        </div>
      </ErrorBoundary>
    );
};

export default ContentEditPage;

