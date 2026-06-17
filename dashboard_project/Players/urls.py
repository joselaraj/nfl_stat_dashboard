from django.urls import path 
from . import views
from .views import PlayerListView, PlayerDetailView, RunningBackListView, WideReceiverListView, TightEndListView, KickerEndListView, qb_player_detail, rb_player_detail, wr_player_detail, te_player_detail, k_player_detail

# API endpoints only
urlpatterns = [
    path('qbs/', PlayerListView.as_view(), name='player-list'),
    path('qbs/<str:player_id>/', PlayerDetailView.as_view(), name='player-detail'),
    path('rbs/', RunningBackListView.as_view(), name='rb-list'),
    path('wrs/', WideReceiverListView.as_view(),name='wr-list'),
    path('tes/',TightEndListView.as_view(),name="te-list"),
    path('k/',KickerEndListView.as_view(),name="k-list"),
    path('qbs/<str:player_id>/detail/', qb_player_detail, name='qb_player_detail'),
    path('rbs/<str:player_id>/detail/', rb_player_detail, name='rb_player_detail'),
    path('wrs/<str:player_id>/detail/', wr_player_detail, name='wr_player_detail'),
    path('tes/<str:player_id>/detail/', te_player_detail, name='te_player_detail'),
    path('k/<str:player_id>/detail/', k_player_detail, name='k_player_detail'),
]