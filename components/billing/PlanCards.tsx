import {
  Card,
  Text,
  Button,
} from "@shopify/polaris";

export default function PlanCards({
  onSubscribe,
}: {
  onSubscribe: (plan: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "80px",
        justifyContent: "center",
        paddingTop: "16px",
        paddingBottom: "16px",
      }}
    >
      {/* Beginner (Free) */}
      <div style={{ flex: "1 1 300px", maxWidth: "380px", minWidth: "280px" }}>
        <Card sectioned>
          <Text variant="headingMd" as="h1">Beginner</Text>
          <Text variant="headingLg" as="h2" fontWeight="bold">Free</Text>
          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <Button fullWidth onClick={() => onSubscribe("Free")}>
              Switch to Free
            </Button>
          </div>
          <ul style={{ paddingLeft: "20px", marginTop: "16px" }}>
            <li>Customizable labels</li>
            <li>Professional reports</li>
            <li>Up to 88% shipping discount</li>
            <li>Customer-paid return labels</li>
            <li>5 staff accounts</li>
            <li>POS Lite</li>
          </ul>
        </Card>
      </div>

      {/* Premium Plan */}
      <div style={{ flex: "1 1 300px", maxWidth: "380px", minWidth: "280px" }}>
        <Card sectioned>
          <Text variant="headingMd" as="h3">Advanced</Text>
          <Text variant="headingLg" as="h2" fontWeight="bold">
            ₹499 <Text as="span" variant="bodySm">/ month</Text>
          </Text>
          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <Button fullWidth onClick={() => onSubscribe("Premium")}>
              Subscribe
            </Button>
          </div>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li>Returns portal</li>
            <li>Unlimited returns</li>
            <li>Custom messaging</li>
            <li>Customer-paid return labels</li>
            <li>Custom email notifications</li>
            <li>Plan integration</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
