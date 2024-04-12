// import React from 'react'

// const AddLessonForm = () => {
//   return (
//     <div>addLessonForm</div>
//   )
// }

// export default AddLessonForm;

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

import { Steps, theme } from "antd";
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
import UploadFileWidget from "./uploadFile";
import { authHeaders } from "../HomePage/AuthHeaders/AuthHeaders";
import ImageUploadWidget from "../widgets/imageUploadWidget";
const { RangePicker } = DatePicker;

const departments = [
  {
    label: "Computer Science and Engineering",
    value: "computerScienceEngineering",
  },
  {
    label: "Electrical Engineering",
    value: "electricalEngineering",
  },
  {
    label: "Mechanical Engineering",
    value: "mechanicalEngineering",
  },
  {
    label: "Civil Engineering",
    value: "civilEngineering",
  },
  {
    label: "Chemical Engineering",
    value: "chemicalEngineering",
  },
  {
    label: "Biomedical Engineering",
    value: "biomedicalEngineering",
  },
];

const semesters = [
  {
    label: "First Semester",
    value: "firstSemester",
  },
  {
    label: "Second Semester",
    value: "secondSemester",
  },
  {
    label: "Third Semester",
    value: "thirdSemester",
  },
  {
    label: "Fourth Semester",
    value: "fourthSemester",
  },
  {
    label: "Fifth Semester",
    value: "fifthSemester",
  },
  {
    label: "Sixth Semester",
    value: "sixthSemester",
  },
  {
    label: "Seventh Semester",
    value: "seventhSemester",
  },
  {
    label: "Eighth Semester",
    value: "eighthSemester",
  },
];

const AddLessonForm = ({
  chapterId,
  setChapterId,
  setMenuItems,
  menuItems,
}: // setModal1Open,
// modal1Open,
any) => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [form] = Form.useForm();
  // console.log(chapterId, "chapterId---")
  const meta = {
    fields: [
      {
        key: "name",
        label: "Chapter Name",
        placeholder: "Enter Chapter Name",
        // required: true,
      },
      {
        key: "image",
        label: "Image",
        placeholder: "Upload Image",
        widget: ImageUploadWidget,
      },
      {
        key: "status",
        label: "Status",
        placeholder: "Select Status",
        widget: "select",
        options: [
          {
            label: "Published",
            value: "published",
          },
          {
            label: "Un Published",
            value: "unpublished",
          },
          {
            label: "Draft",
            value: "draft",
          },
        ],
      },
      // {
      //   key: "schedule",
      //   label: "Schedule",
      //   placeholder: "Enter Value",
      //   widget: RangePicker,
      // },
    ],
  };

  const handleAddLesson = (values: any) => {
    let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
    // console.log("Submit: ", values, formData);
    axios
      .post(
        `${BASE_API_URL}/content/chapter`,
        { ...formData, courseId: chapterId?.courseId },
        authHeaders()
      )
      .then((res: any) => {
        let data = [...(res.data.data || [])];
      });
    // console.log()
    let data = [...menuItems];
    data[chapterId.selectedCourseIndex].children = [
      ...data[chapterId.selectedCourseIndex].children,
      { key: formData?.name },
    ];
    setMenuItems(data)
    form.resetFields();
    setCurrent(0);
    setChapterId({
      ...chapterId,
      showModal: false,
      courseId: "",
    });
    message.success("Processing complete!");
  };

  return (
    <div>
      <Modal
        // className="Modal-Course"
        // title="Create a New Course"
        mask={true}
        centered
        destroyOnClose
        open={chapterId.showModal}
        // footer={false}
        onOk={() => {
          form.submit();
          // form
          //   .validateFields()
          //   .then(() => {
          //     form.submit();
          //   })
          //   .catch(() => {
          //     message.error("Please Fill Required Fields!");
          //   });
        }}
        onCancel={() => {
          form.resetFields();
          setChapterId({
            ...chapterId,
            showModal: false,
            courseId: "",
          });
        }}
        cancelText="Cancel"
        okText="Save & Proceed"
      >
        <Form
          form={form}
          onFinish={handleAddLesson}
          onValuesChange={(event) => {
            setFormData({ ...formData, ...event });
          }}
        >
          <FormBuilder form={form} meta={meta} />
        </Form>
      </Modal>
    </div>
  );
};

export default AddLessonForm;
