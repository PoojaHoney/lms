import React from "react";
import { Input, Tabs } from "antd";
import type { TabsProps } from "antd";
import PlainEditor from "../../widgets/quillEditor";
const { TextArea } = Input;
const onChange = (key: string) => {
    console.log(key);
};



const ContentEditTab = ({ chapterData, setChapterData }: any) => {

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "Description",
            //   children: chapterData?.content || "",
            children: (
                <TextArea rows={15}  value={chapterData?.description}
                onChange={(e: any) => {
                  let data: any = {...chapterData};
                  data.content = e.target.value;
                  setChapterData(data);
                }}
                />
            )
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
            children: "Attachments",
        },
    ];

    return (
        <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
            style={{ width: 300 }}
        />
    );
};

export default ContentEditTab;
