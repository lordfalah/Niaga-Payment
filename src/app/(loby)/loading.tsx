import FormOrderSkeleton from "./_components/form-order-skeleton";
import CardLoby from "./_components/card-loby";

export default function LoadingRoot() {
  return (
    <CardLoby
      title="Niaga Order"
      subTitle={`Made by Mr.fal`}
      description="Wait page is Loading..."
    >
      <FormOrderSkeleton />
    </CardLoby>
  );
}
