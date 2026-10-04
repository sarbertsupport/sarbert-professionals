package com.albert.microservices.teaching.marketplace.utils;

public class Constants {
    public static final int CODE_SUCCESS=200;
    public static final int CODE_CONFLICT=409;
    public static final int CODE_VALIDATION=400;
    public static final int CODE_NOT_FOUND=404;
    public static final int CODE_SERVER_ERROR=500;
    public static final int UNAUTHORIZED=401;
    public static final String UNAUTHORIZED_VALUE="Unauthorized";
    public static final String SUCCESS_CREATE="User Created Successfully." +
            " A link to verify your account has been emailed to you and will expiry in 24 hours.";
    public static final String CONFLICT_EMAIL="Email Already Exist";
    public static final String ERROR ="An Error occured";
    public static final String CONFLICT_USERNAME="Username Already Exist";
    public static final String CONFLICT_ROLE="Role Already Exist";
    public static final String PASSWORD_MISMATCH="Passwords Do not Match";
    public static final String CONFLICT="conflict";
    public static final String RECORD_NOT_FOUND="Record not found";
    public static final String SUCCESS="Success";
    public static final String OPERATION_SUCCESS="Operation completed successfully";
    public static final String SUCCESS_ROLE="Role Created Successfully";
    public static final String SERVER="internal Server Error";
    public static final String SERVER_ERROR="An error occurred, please try again";
    public static final String NOTFOUND="Not Found";
    public static final String BAD_REQUEST="Bad Request";
    public static final String EXPIRED_ACTIVATION_TOKEN="The activation token has expired.";
    public static final String ACCOUNT_VERIFICATION_SUCCESS="User Account has been Verified Successfully";
    public static final String INVALID_TOKEN="Invalid activation Token";
    public static final String ACTIVATION_ERROR="An error occurred while verifying user Account";

}
