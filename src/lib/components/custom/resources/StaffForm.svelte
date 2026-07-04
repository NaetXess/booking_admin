<!-- StaffForm.svelte -->
<script>
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Input from '@components/Input.svelte';
	import Tooltip from '@components/helpers/Tooltip.svelte';
	import UserPicker from './UserPicker.svelte';

	/** @type {{data?: any, formDatas?: any}} */
	let { data = $bindable({}), formDatas = {} } = $props();

	// Set default values if not defined to prevent undefined fields
	if (data.beginat === undefined) data.beginat = '09:00';
	if (data.endat === undefined) data.endat = '18:00';
	if (data.limit === undefined) data.limit = 1;
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
				<Input id="res-name" placeholder="Birim adı giriniz" bind:value={data.name} />
			</Col>

			<Col width="12">
				<label for="res-limit"
					>Kapasite
					<Tooltip text="Personelin tek seferde alabileceği randevu sayısı" position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="number" id="res-limit" placeholder="1" icon="bx-cog" bind:value={data.limit} />
			</Col>
			<Col width="6">
				<label for="begin-at"
					>Başlangıç Zamanı
					<Tooltip text="Personelin çalışma saati başlangıcı" position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="time" id="begin-at" icon="bx-cog" bind:value={data.beginat} />
			</Col>
			<Col width="6">
				<label for="end-at"
					>Bitiş Zamanı
					<Tooltip text="Personelin çalışma saati bitişi" position="top">
						<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
					</Tooltip>
				</label>
				<Input type="time" id="end-at" icon="bx-cog" bind:value={data.endat} />
			</Col>
		</Row>
	</Col>

	<Col width="4" style="h-100 pt-4 pb-3">
		<label for="">
			Kullanıcı Hesabı Bağlama
			<Tooltip
				text={`Kullanıcının panel bilgileriyle sisteme giriş yapıp 
				kendi verilerini görebilmesi için hesap bağlantısı`}
				position="top"
			>
				<i class="bx bx-info-circle" style="color:#aaa; cursor:default"></i>
			</Tooltip>
		</label>
		<UserPicker users={formDatas.users} bind:value={data.user_id} />
	</Col>
</Row>
