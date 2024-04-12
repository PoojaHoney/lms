import React, { useEffect, useState } from "react";
import "../styles.css";
import { FaRegEdit } from "react-icons/fa";

import { Button, Image, Input, Modal, Select, Spin, Tag, message } from "antd";
import ContentViewTab from "./contentViewTab";
import { CheckCircleFilled, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { authHeaders } from "../../HomePage/AuthHeaders/AuthHeaders";
import ErrorBoundary from "../../../utils/ErrorBoundaries";
import { departmentsObj, languageObj, levelsObj } from "../../../utils/constants";
import ViewFields from "./viewFields";

const CourseViewPage = ({ chapterId, setIsEdit }: any) => {
  const [chapterData, setChapterData] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteValue, setDeleteValue] = useState<any>("");
  let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
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

  const deleteLessonItem = (chapterId: any, contentType: any) => {
    axios
      .delete(
        `${BASE_API_URL}/content/${contentType}/${chapterId}`,
        // {
        //   filter: {},
        //   search: "",
        // },
        authHeaders()
      )
      .then((res: any) => {
        message.success("Deleted Successfully!");
        // setLoading(false);
      })
      .catch((oError) => {
        console.log("oError");
      });
  }
  console.log(chapterData, "course Data")
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
            <Tag color="geekblue" style={{marginTop: "1rem"}}>Course</Tag>
            <div className="content_edit_title_box">
              <div className="content_edit_title"> {chapterData?.name}</div>
              <div className="content_edit_title_button_box">
                <Button onClick={() => setIsEdit(true)}>
                  <span>Edit </span>
                  <span>
                    <FaRegEdit />
                  </span>
                </Button>
                <Button 
                danger
                //  onClick={() => deleteLessonItem(chapterId?.selectedId, chapterId?.contentType)}
                onClick={() => setShowDelete(!showDelete)}
                 >
                  <DeleteOutlined />
                </Button>
              </div>
            </div>
            <div className="content_edit_chapter_details">
            <div className="content_edit_video_box">
              <Image src={chapterData?.coverImage} style={{minWidth: "300px"}} height={160} />
            </div>
            <ViewFields chapterData={chapterData} setChapterData={setChapterData}  />
              {/* <div className="content_edit_chapter_fields">
              <span>Department:</span>
              <Select
              value={chapterData?.department}
              options={departmentsObj}
              style={{width: "75%"}}
              // variant="borderless"
              placeholder="Select Required Department"
              disabled={true}
              />
              </div> 
              <div className="content_edit_chapter_fields">
              <span>Language:</span>
              <Select
              value={chapterData?.language}
              style={{width: "75%"}}
              options={languageObj}
              // variant="borderless"
              placeholder="Select Required Department"
              disabled={true}
              />
              </div> 
              <div className="content_edit_chapter_fields">
              <span>Level:</span>
              <Select
              style={{width: "75%"}}
              value={chapterData?.level}
              options={levelsObj}
              // variant="borderless"
              placeholder="Select Required Department"
              disabled={true}
              />
              </div>  */}
            </div>
          </div>
          <div className="content_edit_page_right_panel">
            <div className="content_edit_page_right_tab">
              <ContentViewTab chapterData={chapterData} />
            </div>
          </div>
          {showDelete && (
          <Modal
            title="Confirm delete"
            open={showDelete}
            onOk={() => {
              deleteLessonItem(chapterId?.selectedId, chapterId?.contentType)
              setShowDelete(false);
            }}
            className="listdeletemodal"
            onCancel={() => setShowDelete(false)}
            okButtonProps={{ disabled: deleteValue == "Delete" ? false : true }}
            cancelButtonProps={{ disabled: false }}
          >
            <h3>{chapterData?.title || chapterData?.name}</h3>
            {/* <span>Type "Delete" message for confirmation</span> */}
            <Input
              placeholder="Type 'Delete' message for confirmation"
              onChange={(e: any) => setDeleteValue(e.target.value)}
            />
          </Modal>
        )}
        </div>
      </ErrorBoundary>
    );
};

export default CourseViewPage;
