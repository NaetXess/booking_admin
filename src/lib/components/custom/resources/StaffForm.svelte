<script>
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Input from '@components/Input.svelte';
	import Tooltip from '@components/helpers/Tooltip.svelte';
	import { onMount } from 'svelte';
	import UserPicker from './UserPicker.svelte';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let data = {};
	export let formDatas = {};

	let name;

	let id;
	let limit;
	let beginAt = '08:00';
	let endAt = '19:30';
	let userId = '';

	$: dispatch('input', {
		data: {
			...(id && { id }),
			name,
			limit,
			beginat: beginAt,
			endat: endAt,
			user_id: userId
		}
	});

	onMount(() => {
		if (data) {
			id = data.id;
			name = data.name;
			limit = data.limit;
			beginAt = data.beginAt;
			endAt = data.endAt;
			userId = data.user_id;
		}
	});
</script>

<Row classess="h-100">
	<Col width="8">
		<Row>
			<Col width="12">
				<label for="res-name"
					>Adı
					<Tooltip text="Personelin uygulamada görünecek adı veya ünvanı." position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input id="res-name" placeholder="Birim adı giriniz" bind:value={name} />
			</Col>

			<Col width="12">
				<label for="res-limit"
					>Kapasite
					<Tooltip text="Personelin saat periyotları arasında ki " position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="number" id="res-limit" placeholder="1" icon="bx-cog" bind:value={limit} />
			</Col>
			<Col width="6">
				<label for="begin-at"
					>Başlangıç Zamanı
					<Tooltip text="Personelin günlük maksimum randevu sayısı" position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="time" id="begin-at" icon="bx-cog" bind:value={beginAt} />
			</Col>
			<Col width="6">
				<label for="end-at"
					>Bitiş Zamanı
					<Tooltip text="Personelin günlük maksimum randevu sayısı" position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="time" id="end-at" icon="bx-cog" bind:value={endAt} />
			</Col>
		</Row>
	</Col>

	<Col width="4" style="h-100 pt-4 pb-3">
		<label for="">
			Kullanıcı Hesabı Bağlama
			<Tooltip text="Personelin günlük maksimum randevu sayısı" position="top">
				<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
			</Tooltip>
		</label>
		<UserPicker users={formDatas.users} bind:value={userId} />
	</Col>
</Row>
