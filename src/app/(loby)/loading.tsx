import FormOrderSkeleton from "./_components/form-order-skeleton";
import CardLoby from "./_components/card-loby";

export default function LoadingRoot() {
  return (
    <CardLoby
      title="Niaga Order"
      subTitle={`Create Order by {session.user.name}`}
      description="Enter your email below to login to your account"
    >
      <FormOrderSkeleton />
    </CardLoby>
  );
}
