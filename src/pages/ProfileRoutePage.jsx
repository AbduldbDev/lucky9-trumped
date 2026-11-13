import ProfilePage from "../components/profile/ProfilePage.jsx";
import LobbySkeleton from "../components/intro/LobbySkeleton.jsx";
import { AudioProvider } from "../contexts/AudioContext.jsx";
import { useProfile } from "../hooks/useProfile.js";

/** /profile: loads the profile and wires the profile actions. */
export default function ProfileRoutePage() {
  const { profile, equip, setTableColor, rename } = useProfile();

  if (!profile) return <LobbySkeleton />;

  return (
    <AudioProvider>
      <ProfilePage
        profile={profile}
        onEquipSkin={equip}
        onSetTableColor={setTableColor}
        onRename={rename}
      />
    </AudioProvider>
  );
}
