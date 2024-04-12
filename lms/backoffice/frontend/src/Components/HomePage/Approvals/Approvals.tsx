import { Typography, Row, Col, Avatar, Input, Button, Form, List, Tooltip, Tag, Tabs, message } from "antd"
import { useEffect, useState } from "react";
import DemoVid from '../Demovideo.mp4'
import Cardimg from '../Images/cardimg.png'
import Chapterimg from '../Images/chapter.png'
import Pdfimg from '../Images/pdf.png'
import { authHeaders } from "../AuthHeaders/AuthHeaders";
import './Approvals.css'
import { TeamOutlined, AuditOutlined, MenuOutlined, ReadOutlined, FieldTimeOutlined, EyeOutlined, AntDesignOutlined, RightOutlined, UserOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const Approvals = () => {
    const [form] = Form.useForm()
    const [ViewCard, setViewCard] = useState(!false)
    const [ViewApproval, setViewApproval] = useState(!false)
    const [oSelectedApporval, setSelectedApprovals] = useState<any>()
    const [oApprovalsData, setApprovalsData] = useState<any>([])
    const [oApprovalsChapters, setApprovalsChapters] = useState<any>([])
    useEffect(() => {
        axios.get("http://34.100.176.190:4001/api/content/v1/content/approvals", authHeaders())
            .then((oResponse) => {
                const oData = oResponse.data.data;

                let oCatelog: any = {}
                // oData.map((ofield:any,index:any)=>{
                //     coursesdata.push({
                //         title:ofield.name,
                //         description:ofield.address,
                //         Avatar:ofield.role
                //     })
                // })
                Object.keys(oData[0]).map((ofield) => {
                    oCatelog[ofield] = ''
                })
                setApprovalsData(oData)
                console.log(oData)
                // console.log(oResponse)
            })
            .catch((oError) => {
                console.log("oError")
            })
    }, [])

    const GetApprovals =()=>{
        axios.get("http://34.100.176.190:4001/api/content/v1/content/approvals", authHeaders())
            .then((oResponse) => {
                const oData = oResponse.data.data;

                let oCatelog: any = {}
                // oData.map((ofield:any,index:any)=>{
                //     coursesdata.push({
                //         title:ofield.name,
                //         description:ofield.address,
                //         Avatar:ofield.role
                //     })
                // })
                Object.keys(oData[0]).map((ofield) => {
                    oCatelog[ofield] = ''
                })
                setApprovalsData(oData)
                console.log(oData)
                // console.log(oResponse)
            })
            .catch((oError) => {
                console.log("oError")
            })
    }
    const oApprovalsInfo = [
        {
            title: "Mark",
            Status: "Pending",
            Description: "Fe324r",
            Subject: "ComputerScience",
            Avatar: "M"
        },
        {
            title: "Steve",
            Status: "Rejected",
            Description: "Fe324r",
            Subject: "Mechanical",
            Avatar: "S"
        }
    ]

    const oAttachments = [
        {
            Title: "Darrell Steward",
            Description: "PDF"
        },
        {
            Title: "Darrell Steward",
            Description: "PDF"
        },
        {
            Title: "Darrell Steward",
            Description: "PDF"
        },
        {
            Title: "Darrell Steward",
            Description: "PDF",
        },
        {
            Title: "Darrell Steward",
            Description: "PDF"
        },
    ]
    const Classestabs = [
        {
            label: 'Attachments',
            key: '1',
            children: <>
                <List className="Approvals-UserList" dataSource={oAttachments}
                    renderItem={(item: any) => (
                        <List.Item className="User-ListItem" actions={[<EyeOutlined />, <Button type="text" icon={<RightOutlined />} />]}>
                            <List.Item.Meta avatar={<Avatar src={Pdfimg}></Avatar>}
                                title={item?.Title} description={item?.Description} />
                        </List.Item>
                    )}>

                </List>
            </>
        },
        {
            label: 'Primary',
            key: '2',
            children: 'Primary',
            disabled: true,
        },
        {
            label: 'Chapters',
            key: '3',
            children: 'Chapters',
            disabled: true,
        },
    ]
    const RequestsData = [

        {
            title: "NewChapter",
            Status: "Pending Approval",
            Description: "ComputerScience",
            Avatar: { Chapterimg }
        },
        {
            title: "NewChapter",
            Status: "Pending Approval",
            Description: "ComputerScience",
            Avatar: { Chapterimg }
        }

    ]
    const UserDetailsTabs = [
        {
            label: 'Requests',
            key: '1',
            children: (
                <>
                    <List className="Approvals-UserList" dataSource={oApprovalsChapters}
                        renderItem={(item: any) => (
                            <List.Item onClick={() => onApprovals(item)} className="User-ListItem" actions={[<Tag color={item?.Status === "Pending Approval" ? "processing" : item?.Status === "Approved" ? "success" : "error"}>{item?.Status}</Tag>]}>
                                <List.Item.Meta avatar={<Avatar src={Chapterimg}></Avatar>}
                                    title={item?.name} description={item?.description} />
                            </List.Item>
                        )}>

                    </List>
                </>
            ),
        },
        {
            label: 'Enrolled',
            key: '2',
            children: 'Enrolled',
            disabled: true,
        }
    ]
    const onApprovalList = (oitem: any) => {
        console.log(oitem)
        setSelectedApprovals(oitem)
        setApprovalsChapters([oitem?.details])
        form.setFieldsValue({
            Designation: oitem?.requestedBy?.role,
            Department: oitem?.details?.department
        })
        setViewCard(!true)
    }
    const onApprovals = (oitem: any) => {
        console.log(oitem)
        setViewApproval(!true)


    }
    const onApproveCancel = () => {
        setViewCard(!false)
        setViewApproval(!false)

    }
    const onSaveApproval = () => {
        const oSave = {
            contentId: oSelectedApporval?.contentId,
            approval: true,
            comment: "good"
        }
        axios.put(`http://34.100.176.190:4001/api/content/v1/content/approve`, oSave, authHeaders())
            .then((oResponse) => {
                message.success("Approved Successfully")
                onApproveCancel()
                GetApprovals()
            })
            .catch((oError) => {
                message.error("Approve Failed")
            })

    }
    return (
        <Row className="Approvals">
            <Row className="ApprovalsTitle" >
                <Title title="Approvals">Approvals</Title>
            </Row>
            <Row>

                <Col className="ApprovalsInfo">
                    <Input className="Search-box" placeholder="Search" prefix={<SearchOutlined />} suffix={
                        <>
                            <FilterOutlined />

                        </>
                    } />
                    <List className="Approvals-MenuList" dataSource={oApprovalsData}
                        renderItem={(item: any) => (
                            <List.Item onClick={() => onApprovalList(item)} className="User-ListItem" actions={[<Tag color={item?.contentStatus === "pending" ? "processing" : item?.contentStatus === "approved" ? "success" : "error"}>{item?.contentStatus}</Tag>]}>
                                <List.Item.Meta avatar={<Avatar className="Approvals-Avatar" src={Cardimg}></Avatar>}
                                    title={item?.requestedBy?.name} description={item?.Description} />
                                <div className="Subject">{item?.details?.department}</div>
                            </List.Item>
                        )}>

                    </List>
                </Col>
                <Col hidden={ViewApproval} className="Approvals_UserClases">
                    {/* <div className="Approvals_UserClases-div"> */}

                    <Row className="UserClasses-title" justify="space-between">
                        <Col className="Title-Chapter">
                            <Title>Chapter-1</Title>
                        </Col>
                        <Col className="UserClasses-Actions">
                            <Button onClick={onApproveCancel}>Cancel</Button>
                            <Button disabled={oSelectedApporval?.contentStatus === "approved" ? true : false } onClick={onSaveApproval} type="primary">Publish</Button>
                        </Col>
                    </Row>
                    <Row className="UserClasses-VideoInfo">
                        <Col className="UserClasses-Video">
                            <video controls>
                                <source src={DemoVid} type="video/mp4" />
                            </video>

                        </Col>
                        <Col className="UserClasses-Info">
                            <Title className="Title">{oSelectedApporval?.details?.name}</Title>
                            <Row className="UserClasses-AvatarGroups">

                                <Avatar.Group>
                                    <Avatar src="https://joeschmoe.io/api/v1/random" />
                                    <Avatar style={{ backgroundColor: 'green' }}>K</Avatar>
                                    <Tooltip title="Ant User" placement="top">
                                        <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                                    </Tooltip>
                                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<AntDesignOutlined />} />
                                </Avatar.Group>
                            </Row>
                            <Text type="secondary">John, Joseph, Joey and 6 others</Text>
                            <Row className="UserClases-ChapterInfo">
                                <Text type="secondary" ><UserOutlined /> 500 Student</Text>
                                <Text type="secondary" ><MenuOutlined /> 5 Modul</Text>
                                <Text type="secondary" ><FieldTimeOutlined /> {oSelectedApporval?.details?.duration}</Text>

                            </Row>
                        </Col>
                    </Row>
                    <Row className="UserClasses-Tabs">
                        <Tabs items={Classestabs} />

                    </Row>
                    {/* </div> */}
                </Col>
                <Col hidden={ViewCard} className="Approvals_UserDetails">

                    <div className="UserDetails-Card">
                        <Row className="title" justify="space-between">

                            <img
                                alt="example"
                                src={Cardimg}
                            />
                            {/* <Form
                                form={form} {...layout}
                            >
                                <FormBuilder viewMode form={form} meta={userFormMeta} />
                            </Form> */}
                            <Col>
                                <Text className="Value">{oSelectedApporval?.requestedBy?.name}</Text>
                                <Row>
                                    <Text type="secondary">Designation:</Text>
                                    <Text className="Value" >{oSelectedApporval?.requestedBy?.role}</Text>

                                </Row>
                                <Row>
                                    <Text type="secondary">Department:</Text>
                                    <Text className="Value"  >{oSelectedApporval?.details?.department}</Text>

                                </Row>
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Button icon={<ReadOutlined />}>8</Button>
                            <Button icon={<AuditOutlined />}>8</Button>
                            <Button icon={<TeamOutlined />}>263</Button>
                        </Row>
                    </div>
                    <Tabs items={UserDetailsTabs} />

                </Col>

            </Row>
        </Row >
    )
}
export default Approvals