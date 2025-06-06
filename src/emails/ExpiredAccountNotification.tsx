import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Column,
  Row,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ExpiredAccountNotificationProps {
  accountName: string;
  serviceName: string;
  expiredDate: string;
  accountType: "personal" | "shared";
  userCount: number;
  users: {
    id: string;
    full_name: string | null;
    email: string;
    phone_number: string | null;
  }[];
  serviceId: string;
  accountId: string;
  dashboardUrl?: string;
}

export const ExpiredAccountNotification = ({
  accountName = "Sample Account",
  serviceName = "Sample Service",
  expiredDate = "2024-01-15",
  accountType = "shared",
  userCount = 3,
  users = [
    {
      id: "1",
      full_name: "John Doe",
      email: "john@example.com",
      phone_number: "+1234567890",
    },
  ],
  serviceId = "service-123",
  accountId = "account-456",
  dashboardUrl = "https://your-domain.com",
}: ExpiredAccountNotificationProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const expiredDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - expiredDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // WhatsApp phone number formatting function
  const formatWhatsAppNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return null;

    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, "");

    // If number already starts with a country code (more than 8 digits), use as is
    if (digitsOnly.length > 8) {
      // Check if it already has +222 country code
      if (digitsOnly.startsWith("222")) {
        return `+${digitsOnly}`;
      }
      // If it has another country code, don't modify
      return `+${digitsOnly}`;
    }

    // If it's a local number (8 digits or less), add +222
    return `+222${digitsOnly}`;
  };

  // Generate WhatsApp URL
  const getWhatsAppUrl = (phoneNumber: string | null, userName: string) => {
    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    if (!formattedNumber) return null;

    const message = encodeURIComponent(
      `Hello ${userName}, your ${serviceName} account (${accountName}) has expired. Please renew your subscription to continue using the service.`
    );

    return `https://wa.me/${formattedNumber.replace("+", "")}?text=${message}`;
  };

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#2563eb",
                warning: "#f59e0b",
                danger: "#dc2626",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            {/* Header */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                ⚠️ Account Expired - Action Required
              </Heading>
              <Text className="text-gray-600 text-sm">
                Services Management - Automatic Notification
              </Text>
            </Section>

            {/* Alert Section */}
            <Section className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-800 font-semibold mb-2">
                🚨 Account Expiration Alert
              </Text>
              <Text className="text-red-700 text-sm">
                The account &ldquo;{accountName}&rdquo; for service &ldquo;
                {serviceName}&rdquo; expired {getDaysAgo(expiredDate)} days ago
                on {formatDate(expiredDate)}. Users need to renew their
                subscription immediately.
              </Text>
            </Section>

            {/* Account Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <Heading className="text-lg font-semibold text-gray-900 mb-4">
                📋 Account Details
              </Heading>

              <div className="space-y-3">
                <Row>
                  <Column className="w-32">
                    <Text className="text-sm font-medium text-gray-700">
                      Service Name:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-sm text-gray-900">{serviceName}</Text>
                  </Column>
                </Row>
                <Hr className="border-gray-100" />

                <Row>
                  <Column className="w-32">
                    <Text className="text-sm font-medium text-gray-700">
                      Account Name:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-sm text-gray-900">{accountName}</Text>
                  </Column>
                </Row>
                <Hr className="border-gray-100" />

                <Row>
                  <Column className="w-32">
                    <Text className="text-sm font-medium text-gray-700">
                      Account Type:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-sm text-gray-900 capitalize">
                      {accountType}
                    </Text>
                  </Column>
                </Row>
                <Hr className="border-gray-100" />

                <Row>
                  <Column className="w-32">
                    <Text className="text-sm font-medium text-gray-700">
                      Expired Date:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-sm text-red-600 font-medium">
                      {formatDate(expiredDate)}
                    </Text>
                  </Column>
                </Row>
                <Hr className="border-gray-100" />

                <Row>
                  <Column className="w-32">
                    <Text className="text-sm font-medium text-gray-700">
                      Total Users:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-sm text-gray-900">{userCount}</Text>
                  </Column>
                </Row>
              </div>
            </Section>

            {/* User Details */}
            <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <Heading className="text-lg font-semibold text-gray-900 mb-4">
                👥 Affected Users ({userCount}{" "}
                {userCount === 1 ? "user" : "users"})
              </Heading>

              {users.map((user, index) => {
                const whatsappUrl = getWhatsAppUrl(
                  user.phone_number,
                  user.full_name || "User"
                );

                return (
                  <div
                    key={user.id}
                    className="mb-4 last:mb-0 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Row>
                        <Column className="w-16">
                          <Text className="text-xs font-medium text-gray-600">
                            Name:
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-sm font-semibold text-gray-900">
                            {user.full_name || "Not provided"}
                          </Text>
                        </Column>
                      </Row>

                      <Row>
                        <Column className="w-16">
                          <Text className="text-xs font-medium text-gray-600">
                            Email:
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-sm text-blue-600">
                            {user.email}
                          </Text>
                        </Column>
                      </Row>

                      {user.phone_number && (
                        <Row>
                          <Column className="w-16">
                            <Text className="text-xs font-medium text-gray-600">
                              Phone:
                            </Text>
                          </Column>
                          <Column>
                            <Text className="text-sm text-gray-900">
                              {formatWhatsAppNumber(user.phone_number)}
                            </Text>
                          </Column>
                        </Row>
                      )}

                      {whatsappUrl && (
                        <Row className="mt-3">
                          <Column>
                            <Button
                              href={whatsappUrl}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 w-full text-center"
                            >
                              💬 Contact via WhatsApp
                            </Button>
                          </Column>
                        </Row>
                      )}
                    </div>
                    {index < users.length - 1 && (
                      <Hr className="my-3 border-gray-200" />
                    )}
                  </div>
                );
              })}
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs text-gray-500 mb-2">
                This is an automated notification from Services Management
                System
              </Text>
              <Text className="text-xs text-gray-500">
                Generated on{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ExpiredAccountNotification;
