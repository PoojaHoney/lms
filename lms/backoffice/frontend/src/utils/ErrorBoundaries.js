import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorDetails: {} };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    this.setState({ errorDetails: error, hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <span> {this.state.errorDetails.toString()}</span>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;