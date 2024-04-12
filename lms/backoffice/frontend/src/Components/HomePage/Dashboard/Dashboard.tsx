
import { Layout, Collapse, Typography, Row, Col, Avatar, Button, DatePicker, List, Tag, Progress, Statistic } from "antd"
import './Dashboard.css';
import Cardimg from '../Images/cardimg.png'
import Categoryimg from '../Images/Category1.png'
import { ArrowDownOutlined, ArrowUpOutlined, TeamOutlined, CreditCardOutlined, ClockCircleOutlined, CheckCircleOutlined, UserAddOutlined, MoreOutlined } from "@ant-design/icons";
import { Pie, Line } from '@ant-design/plots';
import { authHeaders } from "../AuthHeaders/AuthHeaders";
const { Header, Content, Footer, Sider } = Layout;

const { Title, Paragraph, Text, Link } = Typography;

const { Panel } = Collapse
const Dashboards = () => {
    const oPieConfig = {

        data: [
            { type: 'Category 1', value: 224 },
            { type: 'Category 2', value: 224 },
            { type: 'Category 2', value: 224 },
            { type: 'Category 2', value: 224 },
        ],
        angleField: 'value',
        colorField: 'type',
        paddingRight: 80,
        innerRadius: 0.6,
        label: {
            text: 'value',
            style: {
                fontWeight: 'bold',
            },
        },
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: '125623',
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 40,
                    fontStyle: 'bold',
                },
            },
        ],
    }
    const oLineConfig = {
        data: [
            {
                category: "Courses",
                Month: "Jan",
                Value: "1000"
            },
            {
                category: "Courses",
                Month: "Feb",
                Value: "130"
            },
            {
                category: "Courses",
                Month: "March",
                Value: "150"
            },
            {
                category: "Courses",
                Month: "April",
                Value: "100"
            },
            {
                category: "Users",
                Month: "Jan",
                Value: "90"
            },
            {
                category: "Users",
                Month: "Feb",
                Value: "100"
            },
            {
                category: "Users",
                Month: "March",
                Value: "120"
            },
            {
                category: "Users",
                Month: "April",
                Value: "80"
            },
        ],

        xField: 'Month',
        yField: 'Value',
        sizeField: 'Value',
        shapeField: 'trail',
        legend: { size: false },
        colorField: 'category',
    }
    const oCardDetails = [
        {
            icon: <CreditCardOutlined />,
            Title: "Total Courses",
            DescriptionValue1: "115",
            DescriptionValue2: "+3%"
        },
        {
            icon: <UserAddOutlined />,
            Title: "New Users",
            DescriptionValue1: "78",
            DescriptionValue2: "+12%"
        },
        {
            icon: <TeamOutlined />,
            Title: "Total Accounts",
            DescriptionValue1: "1225",
            DescriptionValue2: "+2%"
        },
        {
            icon: <ClockCircleOutlined />,
            Title: "Total Course time",
            DescriptionValue1: "1:00:52:55",
            DescriptionValue2: "Hours"
        }
    ]
    const oContributors = [
        {
            Name: "Esther Howard",
            Department: 'Financial Innovation',
            Value: '26',
            Avatar: <Cardimg />
        },
        {
            Name: "Esther Howard",
            Department: 'Financial Innovation',
            Value: '26',
            Avatar: <Cardimg />
        },
        {
            Name: "Esther Howard",
            Department: 'Financial Innovation',
            Value: '26',
            Avatar: <Cardimg />
        },
        {
            Name: "Esther Howard",
            Department: 'Financial Innovation',
            Value: '26',
            Avatar: <Cardimg />
        },
        {
            Name: "Esther Howard",
            Department: 'Financial Innovation',
            Value: '26',
            Avatar: <Cardimg />
        },
    ]
    const oCategories = [
        {
            Name: "SHSAT Tutors",
            Value: "1120",
            Percentage: "+12%",
        },
        {
            Name: "SHSAT Tutors",
            Value: "1120",
            Percentage: "+12%",
        },
        {
            Name: "SHSAT Tutors",
            Value: "1120",
            Percentage: "+12%",
        },
        {
            Name: "SHSAT Tutors",
            Value: "1120",
            Percentage: "+12%",
        },
    ]
    const oCards = () => {
        return oCardDetails?.map(odata => {
            return (
                <div className="Dashboard-Track_div">
                    <Row className="Dashboard-Icon">
                        <Button type="text" icon={odata?.icon} />
                    </Row>
                    <Row className="Dashboard-Heading">
                        <Title>{odata?.Title}</Title>
                    </Row>
                    <Row className="Dashboard-Description">
                        <Col className="Dashboard-Value">
                            <Text type="secondary">{odata?.DescriptionValue1}</Text>

                        </Col>
                        <Col className="Dashboard-Percentage">
                            <Text type="secondary">{odata?.DescriptionValue2}</Text>
                        </Col>
                    </Row>
                </div>
            )
        })
    }
    return (
        <>
            <Row className="Dashboard-Title">
                <Title>Welcome Back Joey!</Title>
                <Row justify="space-between">

                    <Text type="secondary">Track Your Work Progress</Text>
                    <DatePicker />

                </Row>
            </Row>
            {/* <div className="Dashboard-Track-TotalCourses_div-outline1">

                    </div> */}
            <Row className="Dashboard-Track">
                {oCards()}
            </Row>
            <Row className="Dashboard-GraphReprsentation">
                <Col className="Dashboard-Graph" span={9}>
                    <Row className="Dashboard-Graph-Head" justify="space-between">
                        <Title>Storage Utilized</Title>
                        <Button icon={<MoreOutlined />} />

                    </Row>
                    <Row justify="center" className="Dashboard-Graph-Progress">
                        <Progress strokeColor="Orange" type="dashboard" percent={75.55} />
                    </Row>
                    <Row justify="center" className="Dashboard-Graph-ProgressInfo">
                        <Text type="secondary">63 Accounts Onboarded today!</Text>
                        <Row>
                            <Statistic
                                title="Courses"
                                value={124}
                                precision={0}
                                valueStyle={{ color: '#cf1322' }}
                                suffix={<ArrowDownOutlined />}
                            />
                            <Statistic
                                title="Prof"
                                value={12}
                                precision={0}
                                valueStyle={{ color: '#3f8600' }}
                                suffix={<ArrowUpOutlined />}
                            />
                            <Statistic
                                title="Students"
                                value={155}
                                precision={0}
                                valueStyle={{ color: '#3f8600' }}
                                suffix={<ArrowUpOutlined />}
                            />

                        </Row>
                    </Row>
                </Col>
                <Col className="Dashboard-Statistics" span={15}>
                    <Row>
                        <Title>Statistics</Title>
                    </Row>
                    <Line {...oLineConfig} />
                </Col>
            </Row>
            <Row justify="space-between" className="Dashboard-TotalAnalysis">
                <Col className="Dashboard-TotalAnalysis-div" span={8}>
                    <Pie {...oPieConfig} />
                </Col>
                <Col className="Dashboard-TotalAnalysis-div" span={8}>
                    <Row className="TotalAnalysis-Heading">
                        <Title className="TotalAnalysis-Title">Top Contributors</Title>
                        <Text className="TotalAnalysis-SubTitle" type="secondary">Top Contributors in This Month</Text>
                    </Row>
                    <Row>
                        <List className="Dashboard-TotalAnalysis-List" dataSource={oContributors}
                            renderItem={(item: any) => (
                                <List.Item actions={[<Text>{item?.Value}</Text>]}>
                                    <List.Item.Meta avatar={<Avatar src={Cardimg}></Avatar>}
                                        title={item?.Name} description={item?.Department} />
                                </List.Item>
                            )}>

                        </List>

                    </Row>
                </Col>
                <Col className="Dashboard-TotalAnalysis-div" span={8}>
                    <Row className="TotalAnalysis-Heading">
                        <Title className="TotalAnalysis-Title">Top Category</Title>
                        <Text className="TotalAnalysis-SubTitle" type="secondary">Top Category in This Month</Text>
                    </Row>
                    <Row>
                        <List className="Dashboard-TotalAnalysis-List" dataSource={oCategories}
                            renderItem={(item: any) => (
                                <List.Item actions={[<Text>{item?.Value}</Text>, <Tag icon={<CheckCircleOutlined />} color="success">
                                    {item?.Percentage}
                                </Tag>]}>
                                    <List.Item.Meta avatar={<Avatar src={Categoryimg}></Avatar>}
                                        title={item?.Name} />
                                </List.Item>
                            )}>

                        </List>

                    </Row>
                </Col>
            </Row>
        </>
    )
}
export default Dashboards