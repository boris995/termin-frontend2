import { ImagePlus, Save, Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { Button, Input, PageTitle, Panel, Select } from '../components/ui';
import { Player } from '../types';

type PlayerForm = Pick<
  Player,
  'firstName' | 'lastName' | 'nickname' | 'position' | 'shirtNumber' | 'cardImageUrl' | 'galleryImages' | 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy'
>;

const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

export const PlayerEditor = () => {
  const { id = '1' } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset, setValue, watch } = useForm<PlayerForm>();

  const load = async () => {
    const data = unwrap<Player>(await api.get(`/players/${id}`));
    setPlayer(data);
    setGallery(data.galleryImages || []);
    reset({
      firstName: data.firstName,
      lastName: data.lastName,
      nickname: data.nickname || '',
      position: data.position,
      shirtNumber: data.shirtNumber,
      cardImageUrl: data.cardImageUrl || '',
      galleryImages: data.galleryImages || [],
      pac: data.pac,
      sho: data.sho,
      pas: data.pas,
      dri: data.dri,
      def: data.def,
      phy: data.phy
    });
  };

  useEffect(() => {
    load().catch(() => setMessage('Igrac nije ucitan.'));
  }, [id]);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: 'card' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const uploaded = unwrap<{ url: string }>(await api.post('/uploads/player-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    if (target === 'card') {
      setValue('cardImageUrl', uploaded.url, { shouldDirty: true });
    } else {
      const nextGallery = [...gallery, uploaded.url].slice(0, 6);
      setGallery(nextGallery);
      setValue('galleryImages', nextGallery, { shouldDirty: true });
    }
  };

  const removeGalleryImage = (url: string) => {
    const nextGallery = gallery.filter((item) => item !== url);
    setGallery(nextGallery);
    setValue('galleryImages', nextGallery, { shouldDirty: true });
  };

  const onSubmit = async (values: PlayerForm) => {
    await api.put(`/players/${id}`, {
      ...values,
      nickname: values.nickname || null,
      shirtNumber: Number(values.shirtNumber),
      galleryImages: gallery,
      ...Object.fromEntries(ratingKeys.map((key) => [key, Number(values[key])]))
    });
    setMessage('Igrac je sacuvan.');
    await load();
  };

  const cardImage = watch('cardImageUrl');

  if (!player) {
    return (
      <>
        <PageTitle eyebrow="Admin" title="Editor igraca" />
        <Panel>{message || 'Ucitavanje igraca...'}</Panel>
      </>
    );
  }

  return (
    <>
      <PageTitle eyebrow="Admin" title={`Editor igraca: ${player.firstName} ${player.lastName}`} />
      <div className="mb-5 flex gap-3">
        <Link className="rounded border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" to={`/igraci/${player.id}`}>
          Public profil
        </Link>
        <button className="rounded border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" onClick={() => navigate(-1)}>
          Nazad
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Panel>
          <div className="rounded-lg border border-orange-300/40 bg-gradient-to-br from-orange-400 via-orange-600 to-blue-950 p-4">
            <img className="mx-auto h-72 w-full object-contain" src={assetUrl(cardImage || player.cardImageUrl || '/player-assets/player-card.svg')} alt={player.firstName} />
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-black text-blue-950 hover:bg-orange-400">
            <Upload size={18} />
            Upload card slike
            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, 'card')} />
          </label>
        </Panel>

        <Panel>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Ime" {...register('firstName', { required: true })} />
            <Input placeholder="Prezime" {...register('lastName', { required: true })} />
            <Input placeholder="Nadimak" {...register('nickname')} />
            <Input type="number" min={1} placeholder="Broj dresa" {...register('shirtNumber', { valueAsNumber: true })} />
            <Select {...register('position')}>
              <option value="igrac">igrac</option>
              <option value="golman">golman</option>
              <option value="golman-igrac">golman-igrac</option>
            </Select>
            <Input placeholder="Card image URL" {...register('cardImageUrl')} />
            {ratingKeys.map((key) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-widest text-orange-300">{key}</span>
                <Input type="number" min={0} max={99} {...register(key, { valueAsNumber: true })} />
              </label>
            ))}
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-black">Galerija</h3>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15">
                  <ImagePlus size={17} />
                  Dodaj sliku
                  <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, 'gallery')} />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {gallery.map((image) => (
                  <div key={image} className="relative">
                    <img className="aspect-[4/3] w-full rounded object-cover" src={assetUrl(image)} alt="Galerija igraca" />
                    <button type="button" className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold" onClick={() => removeGalleryImage(image)}>
                      Ukloni
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {message && <p className="md:col-span-2 text-sm text-orange-200">{message}</p>}
            <Button type="submit" className="md:col-span-2">
              <Save size={18} />
              Sacuvaj igraca
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
};
