import {
  Flex,
  Layout,
  Collapse,
  Menu,
  message,
  Typography,
  Row,
  Col,
  Avatar,
  Tree,
  Input,
  Button,
  DatePicker,
  Modal,
  Form,
  Badge,
  Result,
  List,
  Dropdown,
  Card,
  Tooltip,
  Space,
  Divider,
  Tag,
} from "antd";
// import './css/Dashboard.css';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import avatar from "./Images/UB1.jpeg";
import {
  PlusSquareOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import axios from "axios";
import SiderMenu from "./siderMenu";
import { courseItems } from "./coursesMockData";
import FormBuilder from "antd-form-builder";
import AddCourseForm from "./addCoursesForm";
import { authHeaders } from "../HomePage/AuthHeaders/AuthHeaders";
import ContentPage from "./viewPage/contentViewPage";
import ContentViewPage from "./viewPage/contentViewPage";
import AddLessonForm from "./addLessonForm";
import ContentEditPage from "./editPage/contentEditPage";
import ViewPage from "./viewPage";
import EditPage from "./editPage";

const { Header, Content, Footer, Sider } = Layout;

const { Title, Paragraph, Text, Link } = Typography;

const { Panel } = Collapse;

const Courses = () => {
  const [modal1Open, setModal1Open] = useState(false);
  let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
  const [chapterId, setChapterId] = useState<any>({
    showModal: false,
    courseId: "",
    chapterId: "",
  });
  const [form] = Form.useForm();
  const [menuItems, setMenuItems] = useState<any>([]);
  const [searchVal, setSearchVal] = useState<any>("");
  const { RangePicker } = DatePicker;
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const fetchLessonItem = (courseId: any, selectedCourseIndex: number) => {
    setIsLoading(true);
    axios
      .post(
        `${BASE_API_URL}/chapter?courseId=${courseId}`,
        {
          filter: {},
          search: "",
        },
        authHeaders()
      )
      .then((res: any) => {
        let data = [...(res.data.data || [])];
        // let menuData: any = [];
        data = data.map((item: any, index: any) => ({
          key: item?._id,
          chapterId: item?._id,
          label: item?.name,
        }));
        let menuData = [...menuItems];
        menuData[selectedCourseIndex].children = [...data];
        setMenuItems(menuData);
        setIsLoading(false);
      })
      .catch((oError) => {
        console.log("oError");
      });
  };
  useEffect(() => {
    if (menuItems?.length > 0 && menuItems[0].children?.length === 0) {
      // console.log(menuItems);
      // fetchLessonItem(menuItems[0]._id, 0);
      setChapterId({
        ...chapterId,
        selectedId: menuItems[0]._id,
        contentType: "course",
      })
    }
  }, [menuItems]);
  useEffect(() => {
    axios
      .post(
        `${BASE_API_URL}/course`,
        {
          filter: {},
          search: searchVal,
        },
        authHeaders()
      )
      .then((res: any) => {
        let data = [...(res.data.data || [])];
        let menuData = data.map((item: any, index: any) => ({
          key: item?._id,
          _id: item?._id,
          label: item?.name,
          chaptersCount: item?.chaptersCount,
          children: [],
        }));
        setMenuItems(menuData);
        // fetchLessonItem(data[0]._id, 0);
      })
      .catch((oError) => {
        console.log("oError");
      });
  }, [searchVal]);

  const meta = {
    fields: [
      {
        key: "name",
        label: "Course Name",
        placeholder: "Enter Course Name",
        required: true,
      },
      { key: "category", label: "Category", placeholder: "Enter Category" },
      {
        key: "schedule",
        label: "Schedule",
        placeholder: "Enter Value",
        widget: RangePicker,
      },
    ],
  };
  return (
    <div className="course_consumption_container" >
      <div className="course_consumption_title">Courses</div>
      <div className="">
        <Row style={{ width: " -webkit-fill-available" }}>
          <Col span={6} className="Course-Tree">
            <div className="course_search_container">
              <Input
                placeholder="Search"
                variant="borderless"
                prefix={<SearchOutlined />}
                value={searchVal}
                onChange={(e: any) => {
                  setSearchVal(e.target.value);
                }}
                suffix={
                  <>
                    <FilterOutlined />
                    <Tooltip placement="right" title="Add New Course" >
                      <Button onClick={() => setModal1Open(true)} type="primary">
                        Add
                      </Button>
                    </Tooltip>
                  </>
                }
              />
            </div>
            <SiderMenu
              menuItems={menuItems}
              fetchLessonItem={fetchLessonItem}
              chapterId={chapterId}
              setChapterId={setChapterId}
              setIsEdit={setIsEdit}
            />
            {/* <div>Hii</div> */}
          </Col>
          {isEdit  ? (
            <EditPage entity={chapterId} setIsEdit={setIsEdit} />
          ) : (
            <ViewPage entity={chapterId} setIsEdit={setIsEdit} />)}
        </Row>
        <AddCourseForm
          modal1Open={modal1Open}
          menuItems={menuItems}
          setModal1Open={setModal1Open}
          setMenuItems={setMenuItems}
        />
        <AddLessonForm
          chapterId={chapterId}
          setChapterId={setChapterId}
          setModal1Open={setChapterId}
          menuItems={menuItems}
          setMenuItems={setMenuItems}
        />
      </div>
    </div>
  );
};

export default Courses;
