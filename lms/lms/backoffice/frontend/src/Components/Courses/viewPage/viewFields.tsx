import React from 'react';
import { Badge, Descriptions, Select } from 'antd';
import type { DescriptionsProps } from 'antd';
import { departmentsObj, languageObj, levelsObj, semestersObj } from '../../../utils/constants';

const ViewFields = ({ chapterData, setChapterData }: any) => {

    const courseItems: DescriptionsProps['items'] = [
        {
            key: '12',
            label: 'Course Code',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: chapterData?.courseCode,
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
                    disabled={true}
                />
            )
        },
        {
            key: '6',
            label: 'Status',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: <Badge status="success" text={chapterData?.status} />,
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
                    disabled={true}
                />
            ),
        },
        {
            key: '5',
            label: 'Start Date',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: new Date(chapterData?.startDate).toDateString(),
        },
        {
            key: '7',
            label: 'End Date',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: new Date(chapterData?.endDate).toDateString(),
        },
        {
            key: '4',
            label: 'Duration',
            children: `${chapterData?.duration} min`,
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
                    disabled={true}
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
                    disabled={true}
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
                    <div className="content_edit_content_container" dangerouslySetInnerHTML={{ __html: chapterData?.content }} />
                </div>
            ),
        },
        {
            key: '6',
            label: 'Status',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: <Badge status="success" text={chapterData?.status} />,
        },
        {
            key: '12',
            label: 'Order',
            span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
            children: chapterData?.order,
        },
        {
            key: '4',
            label: 'Duration',
            children: `${chapterData?.duration} min`,
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

export default ViewFields;