import { Button, Flex, Layout, Menu, Form, Checkbox, Input, Typography, Row, message, Col, Switch } from "antd"
import DBG from './images/Dimg1.webp'
import LBG1 from './images/Logindivbg1.jpg'
import WCBG from './images/WCBG3.png'
import { LockOutlined, UserOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import './css/Login.css';
// import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react/jsx-runtime"
import { useState } from "react"
import axios from 'axios'
const { Header, Content, Footer } = Layout;
const Login = () => {
    let BASE_USERS_API_URL: any = process.env.REACT_APP_USERS_API;
    const [onloadingLogin, setLoadingLogin] = useState<boolean>(false);
    const navigate = useNavigate()
    const [theme, settheme] = useState('Light')
    const [BackgroundImage, setBackgroundImage] = useState(LBG1)
    const items = [
        {
            key: 'Home',
            label: 'Home'
        },
        {
            key: 'Courses',
            label: 'Courses'
        },
        {
            key: 'Pricing',
            label: 'Pricing'
        },
        {
            key: 'AboutUs',
            label: 'About Us'
        },

    ]
    const onLoginSubmit = (oEvent: any) => {
        setLoadingLogin(true)
        const oData = {
            password: oEvent.password,
            username: oEvent.username

        }
        axios.post(`${BASE_USERS_API_URL}/login`, oData)
            .then(response => {
                console.log(response)
                const oData = response.data
                const oPermission = oData.permissions
                if (oPermission.read && oPermission.write) {
                    sessionStorage.setItem('token', oData.accessToken)
                    message.loading('Verifying', 2.5).then(() => {

                        message.success("Access Granted")
                        navigate('Homepage/Courses')
                    })
                }
                onCloseLoadings()
            })
            .catch(error => {

                onCloseLoadings()
                message.loading('Verifying', 2.5).then(() => message.error("Access Denied"))
            });


    }
    const onCloseLoadings = () => {

        setLoadingLogin(false)
    }
    const onThemeSwitch = () => {
        if (theme === "Light") {
            settheme('Dark')
            setBackgroundImage(DBG)
        } else {

            settheme('Light')
            setBackgroundImage(LBG1)
        }
    }

    return (
        <Fragment>

            {/* <Helmet title="Login" /> */}
            <Layout id={theme} className="Main-Layout" >
                {/* backgroundImage: `url(${DBG})`  */}
                <Row className="Login-Page">
                    {/* <Row className="Header-bar" style={{ width: "-webkit-fill-available" }}>
                        borderBottom: "1px solid black"
                        <Col span={22}>

                            <Menu theme="light" mode="horizontal" items={items} />
                        </Col>
                        <Col>
                            <Switch onClick={onThemeSwitch} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />
                        </Col>

                    </Row> */}
                    <Row className="Login" >
                        <Content>
                            <Row className="Login-div">
                                <Col span={10} className="Form_div">
                                    <Typography className="Form-title">𝔸𝕃ℙℍ-𝔸</Typography>
                                    <Form layout="vertical"
                                        name="normal_login"
                                        className="login-form"
                                        initialValues={{ remember: true }}
                                        onFinish={onLoginSubmit}
                                    >
                                        <Form.Item
                                            name="username" label="Username" className="Form-Username"
                                            rules={[{ required: true, message: 'Please input your Username!' }]}
                                        >
                                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                                        </Form.Item>
                                        <Form.Item
                                            name="password" label="Password" className="Form-Password"
                                            rules={[{ required: true, message: 'Please input your Password!' }]}
                                        >
                                            <Input
                                                prefix={<LockOutlined className="site-form-item-icon" />}
                                                type="password"
                                                placeholder="Password"
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                                <Checkbox>Remember me</Checkbox>
                                            </Form.Item>

                                            <a className="login-form-forgot" href="">
                                                Forgot password?
                                            </a>
                                        </Form.Item>

                                        <Form.Item>
                                            <Button loading={onloadingLogin} type="primary" htmlType="submit" className="login-form-button">
                                                Log in
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Col>
                                <Col span={14} className="Login-logo" style={{ backgroundImage: `url(${WCBG})` }}>

                                </Col>

                            </Row>

                        </Content>

                    </Row>

                </Row>
            </Layout>
        </Fragment>
    )
}

export default Login
