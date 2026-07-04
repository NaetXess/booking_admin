<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { User } from '@controllers/user';
	import Row from '@components/Row.svelte';
	import Col from '@components/Col.svelte';
	import Card from '@components/Card.svelte';
	import Input from '@components/Input.svelte';

	import Select from '@components/Select.svelte';
	import Button from '@components/Button.svelte';
	import Badge from '@components/Badge.svelte';
	import { ROLES } from '@constants/roles';

	let pageTitle = $state();
	let saving = $state();
	let isUpdate = $state(false);

	let id;
	let name = $state();
	let mail = $state();
	let password = $state();
	let userName = $state();
	let role = $state(2);
	let active = $state(1);

	async function handleUserUpsert() {
		let data = {
			name,
			mail,
			username: userName,
			password,
			type: role,
			active
		};

		let res;
		if (!isUpdate) {
			res = await User.create(data);
		} else {
			data.id = id;
			res = await User.update(data);
		}

		if (res) {
			return true;
		}
		return false;
	}

	async function handleSave() {
		saving = true;
		let isOK = await handleUserUpsert();
		if (isOK) {
			setTimeout(() => {
				goto('/users');
			}, 500);
		} else {
			saving = false;
		}
	}

	onMount(init);

	async function init() {
		if ($page.params.page == 'create') {
			pageTitle = 'Kullanıcı Oluştur';
		} else if ($page.params.page == 'update') {
			pageTitle = 'Kullanıcı Düzenle';
			isUpdate = true;
		} else {
			goto('/users');
		}

		if (isUpdate) {
			let res = await User.getById($page.params.id);

			if (res) {
				id = res.id;
				name = res.name;
				userName = res.username;
				mail = res.mail;
				role = res.type;
				active = res.active;
			}
		}
	}
</script>

<div class="d-flex justify-content-between align-items-center">
	<h5 class="my-5 page-title">{pageTitle}</h5>
</div>

<Card>
	<div class="body-wrapper p-4">
		<Row>
			<Col width="6">
				<label for="user-name">Adı</label>
				<Input id="user-name" placeholder="Mustafa Erdem ARSLAN" icon="bx-user" bind:value={name} />
			</Col>
			<Col width="6">
				<label for="user-username">Kullanıcı Adı</label>
				<Input id="user-username" placeholder="marslan" icon="bx-user" bind:value={userName} />
			</Col>
			{#if !isUpdate}
				<Col width="6">
					<label for="user-password">Şifre</label>
					<Input
						id="user-password"
						placeholder="******"
						icon="bx-shield"
						bind:value={password}
						type="password"
					/>
				</Col>
			{/if}
			<Col width={isUpdate ? 12 : 6}>
				<label for="user-mail">Mail</label>
				<Input id="user-name" placeholder="example@gmail.com" icon="bx-user" bind:value={mail} />
			</Col>
			{#if !isUpdate}
				<!-- content here -->
			{/if}
			<Col width="6">
				<label for="user-role">Rol</label>
				<Select icon="bx-pencil" bind:value={role}>
					<option value={1} selected={role == 1}>Admin</option>
					<option value={2} selected={role == 2}>Personel</option>
				</Select>
				<!-- <div class="mt-2">
					<button
						onclick={() => (role = ROLES.ADMIN)}
						class="c-btn {role == ROLES.ADMIN ? 'purple' : ''}">Süper Admin</button
					>
					<button
						onclick={() => (role = ROLES.PERSONEL)}
						class="c-btn {role == ROLES.PERSONEL ? 'orange' : ''}">Personel</button
					>
				</div> -->
			</Col>
			<Col width="6">
				<label for="user-name">Aktif</label>
				<Select icon="bx-pencil" bind:value={active}>
					<option value={0}>Pasif</option>
					<option value={1} selected={active == 1}>Aktif</option>
				</Select>
			</Col>

			<div class="mt-4 text-end">
				<Button
					secondary
					title="Vazgeç"
					on:click={() => {
						goto('/users');
					}}
				/>
				<Button primary title="Kaydet" disabled={saving} on:click={handleSave} />
			</div>
		</Row>
	</div>
</Card>

<style>
	.c-btn {
		background-color: none;
		border: 1px none;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		transition: all ease 150ms;
	}

	.c-btn:hover {
		transform: scale(1.05);
	}
	.c-btn.purple {
		background-color: #f3e8ff;
		color: #7e22ce;
	}

	.c-btn.orange {
		background-color: #ffedd5;
		color: #c2410c;
	}

	.c-btn.pink {
		background-color: #fce7f3;
		color: #be185d;
	}

	.c-btn.green {
		background-color: #dcfce7;
		color: #15803d;
	}

	/* .c-btn.selected {
		border: 1px solid #be185d;
	} */
</style>
