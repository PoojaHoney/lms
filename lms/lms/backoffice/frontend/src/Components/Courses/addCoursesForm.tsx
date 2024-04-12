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
import { departmentsObj, semestersObj, statusObj } from "../../utils/constants";
const { RangePicker } = DatePicker;

const AddCourseForm = ({
  form,
  setMenuItems,
  menuItems,
  setModal1Open,
  modal1Open,
}: any) => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const meta = {
    fields: [
      {
        key: "name",
        label: "Course Name",
        placeholder: "Enter Course Name",
        // required: true,
      },
      {
        key: "courseCode",
        label: "Course Code",
        placeholder: "Enter Course Code",
      },
      {
        key: "department",
        label: "Department",
        placeholder: "Select Department",
        widget: "select",
        options: departmentsObj,
      },
      {
        key: "semester",
        label: "Semester",
        placeholder: "Select Semester",
        widget: "select",
        options: semestersObj,
      },
      {
        key: "batch",
        label: "Batch",
        placeholder: "Select Batch",
        widget: DatePicker,
        widgetProps: {
          onChange:(e: any) => console.log(e, "selected year"), 
          picker:"year",
        }
      },
      {
        key: "status",
        label: "Status",
        placeholder: "Select Status",
        widget: "select",
        options: statusObj,
      },
      // {
      //   key: "schedule",
      //   label: "Schedule",
      //   placeholder: "Enter Value",
      //   widget: RangePicker,
      // },
    ],
  };

  const handleAddCourses = (values: any) => {
    // console.log("Submit: ", values, formData);
    let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
    axios
      .post(
        `${BASE_API_URL}/content/course`,
        { ...formData },
        authHeaders()
      )
      .then((res: any) => {
        let data = [...(res.data.data || [])];
        setMenuItems([
          ...menuItems,
          {
            ...values,
            key: formData?.name,
            label: formData?.name,
            children: [],
          },
        ]);
        form?.resetFields?.();
        setCurrent(0);
        setModal1Open(false);
        message.success(`${formData?.name} Course created!`);
        setFormData({});
      });
    // console.log()

  };
  const steps = [
    {
      title: "Create New Course",
      content: (
        <Form
          form={form}
          // onFinish={handleAddCourses}
          onFinish={(e: any) => console.log(e, "eerere")}

          onValuesChange={(event) => {
            setFormData({ ...formData, ...event });
          }}
        >
          <FormBuilder form={form} meta={meta} initialValues={formData} />
        </Form>
      ),
    },
    {
      title: "Upload File",
      content: <UploadFileWidget />,
      // content: <ImageUploadWidget />,
    },
    // {
    //   title: "User Permissions",
    //   content: <div>THird </div>,
    // },
  ];
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    // textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  return (
    <Form form={form}> 
      <Modal
        // className="Modal-Course"
        // title="Create a New Course"
        mask={true}
        centered
        width={1000}
        // destroyOnClose 
        open={modal1Open}
        footer={false}
        onOk={() => {
          form
            ?.validateFields()
            .then(() => {
              next();
              form.submit();
            })
            .catch(() => {
              message.error("Please Fill Required Fields!");
            });
        }}
        onCancel={() => {
          setModal1Open(false);
          setCurrent(0);
          form?.resetFields?.();
        }}
        cancelText="Save as Draft"
        okText="Save & Proceed"
      >
        {/* <Steps current={current} items={items} /> */}
        <h2>{steps[current].title}</h2>
        <div style={contentStyle}>{steps[current].content}</div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "row-reverse",
          }}
        >
          {current < steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => {
                // form.submit();
                next();
                // form
                //   .validateFields()
                //   .then(() => {
                //     next();
                //   })
                //   .catch(() => {
                //     message.error("Please Fill Required Fields!");
                //   });
                //   form.submit();
              }}
            >
              Save & Proceed
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => handleAddCourses({})}>
              Done
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </Modal>
    </Form>
  );
};

export default AddCourseForm;
