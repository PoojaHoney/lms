import { FileOutlined } from "@ant-design/icons";

export const courseItems = [
  {
    key: "sub1",
    label: "Computer Science",
    icon: <FileOutlined />,
    children: [
      { key: "1", label: "Introduction to Programming" },
      { key: "2", label: "Data Structures" },
      { key: "3", label: "Algorithms" },
    ],
  },
  {
    key: "sub2",
    label: "Software Engineering",
    icon: <FileOutlined />,
    children: [
      { key: "5", label: "Software Development Life Cycle" },
      { key: "6", label: "Requirements Engineering" },
      { key: "7", label: "Software Design" },
      { key: "8", label: "Testing" },
    ],
  },
];