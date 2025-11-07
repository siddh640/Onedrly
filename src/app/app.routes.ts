import { Routes } from '@angular/router';
import { AttractionsDetail } from './components/attractions-detail/attractions-detail';
import { RestaurantsDetail } from './components/restaurants-detail/restaurants-detail';
import { ShoppingDetail } from './components/shopping-detail/shopping-detail';
import { Results } from './components/results/results';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { UserProfile } from './components/user-profile/user-profile';

export const routes: Routes = [
  {
    path: '',
    component: Results
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'profile',
    component: UserProfile
  },
  {
    path: 'attractions/:destination',
    component: AttractionsDetail
  },
  {
    path: 'restaurants/:destination',
    component: RestaurantsDetail
  },
  {
    path: 'shopping/:destination',
    component: ShoppingDetail
  }
];
