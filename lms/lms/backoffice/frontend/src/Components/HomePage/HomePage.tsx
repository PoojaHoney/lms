import { Flex, Layout, Collapse, Menu, Typography, Row, Col, Avatar, Input, Button, DatePicker, Badge, Result, List, Tag, Progress, Statistic } from "antd"
// import './css/Dashboard.css';
import './HomePage.css'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Route, Routes } from "react-router";
import avatar from './Images/UB1.jpeg'
import Cardimg from './Images/cardimg.png'
import Categoryimg from './Images/Category1.png'
import { DashboardOutlined, ArrowDownOutlined, ArrowUpOutlined, TeamOutlined, CreditCardOutlined, ClockCircleOutlined, CheckCircleOutlined, MailOutlined, VerticalRightOutlined, VerticalLeftOutlined, LogoutOutlined, UserAddOutlined, UserOutlined, BellOutlined, CalendarOutlined, UserSwitchOutlined, UnorderedListOutlined, SettingOutlined, MoreOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import Courses from "../Courses";
import { Pie, Line } from '@ant-design/plots';
import Approvals from "./Approvals/Approvals";
import Users from "./Users/Users";
import Dashboards from "./Dashboard/Dashboard";
import { authHeaders } from "./AuthHeaders/AuthHeaders";
const { Header, Content, Footer, Sider } = Layout;

const { Title, Paragraph, Text, Link } = Typography;

const { Panel } = Collapse

export const Contents = () => {
    return (
        <Routes>
            <Route path="/Courses" element={<Courses />} />
            <Route path="/Dashboards" element={<Dashboards />} />
            <Route path="/Users" element={<Users />} />
            <Route path="/Approvals" element={<Approvals />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/More" element={<More />} />
        </Routes>
    )
}



export const More = () => {
    return (
        <Result style={{ width: "-webkit-fill-available" }}
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary">Back Home</Button>}
        />
    )
}
export const Settings = () => {
    return (
        <Result style={{ width: "-webkit-fill-available" }}
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary">Back Home</Button>}
        />
    )
}
const HomePage = () => {
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false);

    const items = [
        {
            key: '/Dashboards',
            label: 'Dashboard',
            icon: <DashboardOutlined />
        },
        {
            key: '/Users',
            label: 'Users',
            icon: <UserSwitchOutlined />
        },
        {
            key: '/Courses',
            label: 'Courses',
            icon: <UnorderedListOutlined />
        },
        {
            key: '/Approvals',
            label: 'Approvals',
            icon: <UnorderedListOutlined />
        },
        {
            key: '/Settings',
            label: 'Settings',
            icon: <SettingOutlined />
        },
        {
            key: '/More',
            label: 'More',
            icon: <MoreOutlined />
        },

    ]
    const onMenuClick = (oEvent: any) => {

        navigate('/Homepage' + oEvent.key)
    }
    const onCollapse = () => {
        setCollapsed(!collapsed)
    }
    return (
        <Layout className="HomePage-Main">
            <Row className="HomePage-Layout">

                <Col className="HomePage-sider" style={{ width: collapsed ? "4%" : "12%" }}>

                    <Row className="Sider-Avatar">
                        <Flex className="title">
                            <Avatar src={avatar} />
                            <Typography style={{ display: collapsed ? "none" : 'inline-block' }}>Sample University</Typography>
                            <Button className={collapsed ? "onCollapse_siderbtn" : "siderbtn"} onClick={onCollapse} icon={collapsed ? <VerticalLeftOutlined /> : <VerticalRightOutlined />} type="primary" />

                        </Flex>

                        <Menu onClick={onMenuClick} className="HomePage-Menu" theme="dark" defaultSelectedKeys={['/Courses']} mode="inline" items={items} />
                    </Row>
                    <Row className={collapsed ? "onCollapse_logoutrow" : "LogoutRow"}>
                        <Button className={collapsed ? "onCollapse_logout" : ""} onClick={() => navigate("/")} type="text" icon={<LogoutOutlined />} ><Text type="secondary">Logout</Text></Button>
                        {/* <Typography className="Form-title">𝔸𝕃ℙℍ-𝔸</Typography> */}
                    </Row>
                </Col>
                <Col className="HomePage_rightView" >
                    <Row className="content-toolbar">
                        <Col span={19} className="Toolbar-search">
                            <Input placeholder="Search" prefix={<SearchOutlined />} />
                        </Col>
                        <Col className="Toolbar-Icons" >
                            <Flex>
                                <Button type="text" icon={<CalendarOutlined />} />
                                <Button type="text" icon={<BellOutlined />} />
                                <Button type="text" icon={<MailOutlined />} />
                                <Badge color="green" dot>
                                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />

                                </Badge>
                                <div className="Toolbar-Admin">
                                    <Text className="Admin">Joey UK</Text><br />
                                    <Text className="Description">Admin</Text>
                                </div>
                                {/* <Button type="text" icon={<DownOutlined />} /> */}
                            </Flex>
                        </Col>
                    </Row>

                    <Row>

                        <Contents />
                    </Row>
                </Col>
            </Row>
        </Layout >
    )
}

export default HomePage