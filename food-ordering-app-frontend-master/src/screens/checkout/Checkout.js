import React from 'react';

import {
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Tabs,
    Typography,
    AppBar,
    Tab,
    useMediaQuery
} from "@material-ui/core";

import {
    withStyles
} from '@material-ui/core/styles';

import {Redirect} from "react-router-dom";
import AddressesGrid from "../../common/checkout/AddressesGrid";
import PaymentOptions from "../../common/checkout/PaymentOptions";
import SaveAddressForm from "../../common/checkout/SaveAddressForm";
import OrderSummaryCard from "../../common/checkout/OrderSummaryCard";
import Notification from "../../common/notification/Notification";
import {GetEndpointURI, GetHttpHeaders, CallApi} from "../../common/utils/ApiHelper";
import Header from "../../common/header/Header";
import "./Checkout.css";

//media query for responsiveness
const useStyles = (theme) => ({
    checkoutContainer: {
        flexDirection: 'row',
    },
    checkoutContainerSm: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepper: {
        padding: "0%"
    },
    tab: {
        maxWidth: "50%"
    },
    workflowStepperContainer: {
        width: '72%',
        padding: '1%'
    },
    workflowStepperContainerSm: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '1%'
    },
    summaryCardContainer: {
        width: '28%',
    },
    summaryCardContainerSm: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '5%',
    },
});

const withMediaQuery = () => Component => props => {
    const isSmallScreen = useMediaQuery('(max-width:650px)');
    return <Component isSmallScreen={isSmallScreen} {...props} />;
};


// Checkout page rendering
class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            activeTab: 0,
            addresses: null,
            states: null,
            paymentMethods: null,
            messageText: null,
            notificationOpen: false,
            addressIndex: -1,
            order: null,
            restaurantName: null,
            orderItems: null,
            netAmount: 0
        }
        this.handleOrderConfirmation = this.handleOrderConfirmation.bind(this);
        this.placeOrder = this.placeOrder.bind(this);
        this.closeNotification = this.closeNotification.bind(this);
        this.setAddressId = this.setAddressId.bind(this);
        this.setPaymentMethodId = this.setPaymentMethodId.bind(this);
        this.setPaymentMethods = this.setPaymentMethods.bind(this);
        this.setStates = this.setStates.bind(this);
        this.setAddresses = this.setAddresses.bind(this);
        this.saveAddress = this.saveAddress.bind(this);
        this.msgSaveOrderNotOK = "Unable to place your order! Please try again!";
        this.msgOrderIncomplete = "Please select delivery address & payment method before placing an order!";
        this.msgSaveOrderOK = "Order placed successfully! Your order ID is $orderId.";
        this.msgSaveAddressNotOK = "Unable to save address! Please try again!";
        this.msgSaveAddressOK = "Address saved successfully!";
        this.msgAddressNotSelected = "Please select an address for delivery!";
        this.msgPaymentNotSelected = "Please select a payment method!";
    }

    getSteps = () => ['Delivery', 'Payment'];
    handleNext = () => {
        if (this.state.activeStep === 0 && !this.state.order.address_id) {
            this.showNotification(this.msgAddressNotSelected);
        } else if (this.state.activeStep === 1 && !this.state.order.payment_id) {
            this.showNotification(this.msgPaymentNotSelected);
        } else {
            this.setState({activeStep: this.state.activeStep + 1});
        }
    }
    handleBack = () => this.setState({activeStep: this.state.activeStep - 1});
    handleReset = () => this.setState({activeStep: 0});
    handleSwitch = (e, v) => this.setState({activeTab: v});
    handleSaveAddress = (result) => {
        if (result) {
            this.setState({activeTab: 0});
            this.showNotification(this.msgSaveAddressOK);
            this.getAddresses();
        } else {
            this.showNotification(this.msgSaveAddressNotOK);
        }
    }
    handleOrderConfirmation = (result, response) => {
        if (result) {
            this.showNotification(this.msgSaveOrderOK.replace("$orderId", response.id));
            setTimeout(() => {
                this.props.history.push("/");
            }, 3000);
        } else {
            this.showNotification(this.msgSaveOrderNotOK);
        }

    }
    showNotification = (message) => this.setState({messageText: message, notificationOpen: true});
    closeNotification = () => this.setState({messageText: null, notificationOpen: false});
    setAddressId = (id) => {
        let order = JSON.parse(JSON.stringify(this.state.order));
        order.address_id = id;
        this.setState({
            addressIndex: this.state.addresses.findIndex(address => address.id === id),
            order: order
        });
    }
    setPaymentMethodId = (id) => {
        let order = JSON.parse(JSON.stringify(this.state.order));
        order.payment_id = id;
        this.setState({order: order});
    }

    setAddresses = (result, response) => {
        if (result) {
            this.setState({addresses: response.addresses});
        } else {
            this.setState({addresses: null});
        }
    }

    getAddresses = () => CallApi(GetEndpointURI('Get Addresses'),
        GetHttpHeaders('GET', "Bearer " + window.sessionStorage.getItem("access-token")),
        this.setAddresses);

    setStates = (result, response) => {
        if (result) {
            this.setState({states: response.states});
        } else {
            this.setState({states: null});
        }
    }

    getStates = () => CallApi(GetEndpointURI('Get States'),
        GetHttpHeaders('GET'), this.setStates);

    setPaymentMethods = (result, response) => {
        if (result) {
            this.setState({paymentMethods: response.paymentMethods});
        } else {
            this.setState({paymentMethods: null});
        }
    }

    getPaymentOptions = () => CallApi(GetEndpointURI('Get Payment Modes'),
        GetHttpHeaders('GET'), this.setPaymentMethods);

    saveAddress = (address, callback) => CallApi(GetEndpointURI('Save Address'),
        GetHttpHeaders('POST', "Bearer " + window.sessionStorage.getItem("access-token"),
            JSON.stringify(address)), callback, this.handleSaveAddress);

    placeOrder = () => {
        if(this.state.activeStep === 2) {
            CallApi(GetEndpointURI('Save Order'),
                GetHttpHeaders('POST', "Bearer " + window.sessionStorage.getItem("access-token"),
                    JSON.stringify(this.state.order)), this.handleOrderConfirmation);
        }else {
            this.showNotification(this.msgOrderIncomplete);
        }
    }

    getStepContent = (step) => {
        const {classes} = this.props;
        switch (step) {
            case 0:
                return (
                    <Box><AppBar position="static">
                        <Tabs value={this.state.activeTab} onChange={this.handleSwitch}>
                            <Tab className={classes.tab} label="EXISTING ADDRESSES"/>
                            <Tab className={classes.tab} label="NEW ADDRESS"/>
                        </Tabs>
                    </AppBar>
                        <Box display={this.state.activeTab === 0 ? "block" : "none"}>
                            <AddressesGrid addresses={this.state.addresses} cols={(this.props.isSmallScreen) ? 2 : 3}
                                           setAddressId={this.setAddressId}
                                           selectedIndex={this.state.addressIndex}/>
                        </Box>
                        <Box display={this.state.activeTab === 1 ? "block" : "none"}>
                            <SaveAddressForm states={this.state.states} handleSaveAddressOK={this.saveAddress}/>
                        </Box>
                    </Box>
                );
            case 1:
                return (<PaymentOptions paymentModes={this.state.paymentMethods}
                                        setPaymentModeId={this.setPaymentMethodId}
                                        selectedPaymentMode={(!this.state.order) ? null : this.state.order.payment_id}/>);
            default:
                return 'Unknown step';
        }
    }

    createOrder = () => {
        let newOrder = {
            address_id: null,
            bill: this.props.location.state.totalAmount,
            item_quantities: [],
            payment_id: null,
            restaurant_id: this.props.location.state.restaurant.id
        };
        this.props.location.state.orderItems && (this.props.location.state.orderItems.length > 0) &&
        this.props.location.state.orderItems.map(orderItem =>
            newOrder.item_quantities.push({
                item_id: orderItem.id,
                quantity: orderItem.quantity,
                price: orderItem.price
            })
        );
        this.setState({order: newOrder});
        this.setState({restaurantName: this.props.location.state.restaurant.restaurant_name});
        this.setState({netAmount: this.props.location.state.totalAmount});
        this.setState({orderItems: JSON.parse(JSON.stringify(this.props.location.state.orderItems))});

    }

    componentDidMount() {
        if (this.props.location.state && this.props.location.state.restaurant &&
            this.props.location.state.totalAmount &&
            this.props.location.state.orderItems) {
            this.createOrder();
            this.getAddresses();
            this.getStates();
            this.getPaymentOptions();
        }
    }

    render() {
        const {classes} = this.props;
        if (this.props.location.state && this.props.location.state.restaurant &&
            this.props.location.state.totalAmount &&
            this.props.location.state.orderItems) {
            return (
                <Box>
                    <Header showSearch={false}/>
                    <Box display="flex"
                         className={(this.props.isSmallScreen) ? classes.checkoutContainerSm : classes.checkoutContainer}
                         width="100%" mt="1%">
                        <Box
                            className={(this.props.isSmallScreen) ? classes.workflowStepperContainerSm : classes.workflowStepperContainer}>
                            <Stepper className={classes.stepper} activeStep={this.state.activeStep}
                                     orientation="vertical">
                                {this.getSteps().map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                        <StepContent>
                                            {this.getStepContent(index)}
                                            <Typography variant="h2" gutterBottom/>
                                            <Box>
                                                <Button disabled={this.state.activeStep === 0}
                                                        onClick={this.handleBack}>Back</Button>
                                                <Button variant="contained" color="primary" onClick={this.handleNext}>
                                                    {this.state.activeStep === this.getSteps().length - 1 ? 'Finish' : 'Next'}
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                            {(this.state.activeStep === this.getSteps().length) ? (
                                <Box padding="2%"><Typography variant="body1">View the summary and place your order
                                    now!</Typography>
                                    <Button onClick={this.handleReset}>
                                        CHANGE
                                    </Button>
                                </Box>) : ""
                            }
                        </Box>
                        <Box
                            className={(this.props.isSmallScreen) ? classes.summaryCardContainerSm : classes.summaryCardContainer}
                            padding="1%">
                            <OrderSummaryCard restaurantName={this.state.restaurantName}
                                              netAmount={this.state.netAmount}
                                              orderItems={this.state.orderItems} order={this.state.order}
                                              handlePlaceOrder={this.placeOrder}/>
                        </Box>
                    </Box>
                    <Notification messageText={this.state.messageText} open={this.state.notificationOpen}
                                  onClose={this.closeNotification}/>
                </Box>
            );
        } else {
            return <Redirect to='/'/>;
        }


    }
}

export default withStyles(useStyles)(withMediaQuery()(Checkout));
