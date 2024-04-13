/* eslint-disable max-len */
export function MondayInstallButton({ className }: { className?: string }) {
  return (
    <a
      className={className}
      href="https://auth.monday.com/oauth2/authorize?client_id=514781cd0f0fc5309eb59f13577cb981&response_type=install"
    >
      <img
        alt="Add to monday.com"
        height="40"
        className="h-[40px]"
        src="https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/uploads/Tal/4b5d9548-0598-436e-a5b6-9bc5f29ee1d9_Group12441.png"
      />
    </a>
  );
}
