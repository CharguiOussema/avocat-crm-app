import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, Typography, Alert, Space } from "antd";
import { useAuth } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import EmailForm from "../../components/common/EmailForm";
import PasswordForm from "../../components/common/PasswordForm";
import { userService } from "../../services/UserService";
import { LoginBodyRequest } from "../../models";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { login } = useAuth();

	const methods = useForm<LoginBodyRequest>();
	const {
		handleSubmit,
		formState: { errors },
		setError,
	} = methods;

	// !example of post or update mutation
	const loginMutation = useMutation({
		mutationFn: (data: LoginBodyRequest) => userService.login(data),
		onSuccess: (response) => {
			login(response.data.accessToken);
			navigate("/");
		},
		onError: (error: unknown) => {
			if (error && typeof error === "object" && "response" in error) {
				const axiosError = error as { response?: { status?: number } };
				if (axiosError.response?.status === 401) {
					setError("root", {
						type: "manual",
						message: t("login.invalidCredentials", "Invalid email or password"),
					});
				} else {
					setError("root", {
						type: "manual",
						message: t(
							"login.errorGeneric",
							"An error occurred. Please try again."
						),
					});
				}
			} else {
				setError("root", {
					type: "manual",
					message: t(
						"login.errorGeneric",
						"An error occurred. Please try again."
					),
				});
			}
		},
	});

	const onSubmit = (data: LoginBodyRequest) => {
		loginMutation.mutate(data);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div className='text-center'>
					<Title level={2} className='text-gray-900'>
						{t("login.title", "Sign in to your account")}
					</Title>
					<Text className='text-gray-600'>
						{t("login.subtitle", "Access your Avocat management system")}
					</Text>
				</div>

				<Card className='shadow-lg'>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							{errors.root && (
								<Alert
									message={errors.root.message}
									type='error'
									showIcon
									className='mb-4'
								/>
							)}

							<div className='space-y-4'>
								<EmailForm />
								<PasswordForm />
							</div>

							<Button
								type='primary'
								htmlType='submit'
								size='large'
								block
								loading={loginMutation.isLoading}
								className='bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700'
							>
								{loginMutation.isLoading
									? t("login.signingIn", "Signing in...")
									: t("login.signIn", "Sign In")}
							</Button>
						</form>
					</FormProvider>

					<div className='mt-6 text-center'>
						<Space direction='vertical' size='small'>
							<Text className='text-gray-500'>
								{t("login.forgotPassword", "Forgot your password?")}
							</Text>
							<Button type='link' className='p-0 h-auto'>
								{t("login.resetPassword", "Reset Password")}
							</Button>
						</Space>
					</div>
				</Card>
			</div>
		</div>
	);
};
