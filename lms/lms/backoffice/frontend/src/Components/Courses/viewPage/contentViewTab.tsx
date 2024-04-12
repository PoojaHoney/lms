import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import PlainEditor from "../../widgets/quillEditor";
import FileUploadWidget from "../../widgets/fileUploadWidget";
import { fileTypeOptions } from "../../../utils/constants";

const onChange = (key: string) => {
  console.log(key);
};



const ContentViewTab = ({ chapterData }: any) => {
  // console.log(chapterData)
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Description",
      children: chapterData?.description || "",
      // children: (
      //   <PlainEditor />
      // )
    },
    {
      key: "2",
      label: "Permissions",
      children: "Permissions",
    },
    {
      key: "3",
      label: "Enrolled",
      children: "Enrolled",
    },
    {
      key: "4",
      label: "Attachments",
      children: (
        <FileUploadWidget
          options={fileTypeOptions}
          value={[{
            name: "phycis-chapetr.jpeg",
            path: "https://engro-xms-dev.engro.in/image/jpeg/660feaffd3b18d0001789ff8.jpeg",
            type: "image"
          },
          {
            name: "phycis-chapetr.jpeg",
            path: "https://engro-xms-dev.engro.in/image/jpeg/660feaffd3b18d0001789ff8.jpeg",
            type: "file"
          },]} />
      ),
    },
  ];

  return (
    <Tabs
      // defaultActiveKey="4"
      items={items}
      onChange={onChange}
      style={{ width: 300 }}
    />
  );
};

export default ContentViewTab;
