import React from 'react';
import { Badge, DatePicker, Descriptions, Input, Select } from 'antd';
import type { DescriptionsProps } from 'antd';
import { departmentsObj, languageObj, levelsObj, semestersObj, statusObj } from '../../../utils/constants';
import DateRangeWidget from '../../widgets/dateRangeWidget';
import PlainEditor from '../../widgets/quillEditor';
const { RangePicker } = DatePicker;
const EditFields = ({ chapterData, setChapterData }: any) => {
    
    const courseItems: DescriptionsProps['items'] = [
        {
            key: '12',
            label: 'Course Code',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            // children: chapterData?.courseCode,
            children: (
                <Input
                 value={chapterData?.courseCode}
                 onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.courseCode = e.target.value;
                    setChapterData(data);
                }}
                placeholder="Enter Course Code"
                  />
            ),
        },
        {
            key: '1',
            label: 'Department',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Select
                    value={chapterData?.department}
                    options={departmentsObj}
                    // style={{ width: "100%" }}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.department = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            )
        },
        {
            key: '6',
            label: 'Status',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Select
                    value={chapterData?.status}
                    options={statusObj}
                    // style={{ width: "100%" }}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.status = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            )
        },
        {
            key: '2',
            label: 'Level',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Select
                    // style={{ width: "100%" }}
                    value={chapterData?.level}
                    options={levelsObj}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.level = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            ),
        },
        {
            key: '5',
            label: 'Scheduled Dates',
            span: 4,
            children: (
                <DateRangeWidget 
                // value={{chapterData.startDate, chapterData.endDate}}
                onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.startDate = e.startDate;
                    data.endDate = e.endDate;
                    setChapterData(data);
                }} 
                 />
            )
        },
        // {
        //     key: '7',
        //     label: 'End Date',
        //     span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
        //     children: new Date(chapterData?.endDate).toDateString(),
        // },
        {
            key: '4',
            label: 'Duration',
            // children: `${chapterData?.duration} min`,
            children: (
                <Input
                 value={chapterData?.duration}
                 onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.duration = e.target.value;
                    setChapterData(data);
                }}
                placeholder="Enter Duration"
                  />
            ),
        },
        {
            key: '3',
            label: 'Language',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Select
                    value={chapterData?.language}
                    // style={{ width: "100%" }}
                    options={languageObj}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.language = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            ),
        },
        {
            key: '8',
            label: 'Semester',
            children: (
                <Select
                    value={chapterData?.semester}
                    // style={{ width: "100%" }}
                    options={semestersObj}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.semester = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            ),
        },
        {
            key: '15',
            label: 'Certification',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: chapterData?.certification,
        },
    ];
    const chapterItems: DescriptionsProps['items'] = [
        {
            key: '2',
            label: 'Content',
            span: 4,
            children: (
                <div>
                <PlainEditor
                  value={chapterData.content || ""}
                  onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.content = e;
                    setChapterData(data);
                  }} />
              </div>
            ),
        },
        {
            key: '6',
            label: 'Status',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Select
                    value={chapterData?.status}
                    options={statusObj}
                    // style={{ width: "100%" }}
                    // variant="borderless"
                    onChange={(e: any) => {
                        let data: any = { ...chapterData };
                        data.status = e;
                        setChapterData(data);
                    }}
                    placeholder="Select Required Department"
                    disabled={false}
                />
            )
        },
        {
            key: '12',
            label: 'Order',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: (
                <Input
                 value={chapterData?.order}
                 onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.order = e.target.value;
                    setChapterData(data);
                }}
                placeholder="Enter Order"
                  />
            ),
        },
        {
            key: '4',
            label: 'Duration',
            children: (
                <Input
                 value={chapterData?.duration}
                 onChange={(e: any) => {
                    let data: any = { ...chapterData };
                    data.duration = e.target.value;
                    setChapterData(data);
                }}
                placeholder="Enter Duration"
                  />
            ),
        },
    ];
    const getItemFields = (contentType: string) => {
        if (contentType === "course") {
            return courseItems
        } else {
            return chapterItems
        }
    }
    return (
        <Descriptions
            column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            title={`${chapterData?.contentType === "course" ? "Course" : "Chapter"} Details`} layout="vertical" bordered items={getItemFields(chapterData?.contentType)} />
    )
};

export default EditFields;