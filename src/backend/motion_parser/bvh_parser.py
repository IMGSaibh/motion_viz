import json
from pathlib import Path
import select
import bvhtoolbox
import numpy as np
from backend.utils import Utils


class BvhParser:
    def __init__(self, bvh_data: str, descriptor_file_path: Path):

        self.bvh_text = bvh_data
        self.descriptor_file_path = descriptor_file_path
        self.descriptor = {}
        self.graph = []
        self.offsets = []
        self.rot_inds = []
        self.pos_inds = []
        self.channel_counter = 0
        self.dataset = {}
        self.framecount = 0
        self.descriptor = {}

    def load_json_descriptor_file(self):

        with open(self.descriptor_file_path, "r") as read_desc_file:
            self.descriptor = json.load(read_desc_file)

        
    def bvhtree_to_data(self, order=["Xrotation","Yrotation","Zrotation"]):

        self.bvh_tree = bvhtoolbox.BvhTree(self.bvh_text)

        if self.descriptor["rotation-representation"] == "euler_zxy":
            order = ["Zrotation","Xrotation","Yrotation"]

        elif self.descriptor["rotation-representation"] == "euler_yxz":
            order = ["Yrotation","Xrotation","Zrotation"]
        else:
            print("Rot order in json not def for bvh")

        for joint in self.bvh_tree.get_joints(end_sites=False):      

            offs = self.bvh_tree.joint_offset(joint.name)
            self.offsets.append(offs)

            jid = self.bvh_tree.get_joint_index(joint.name)             

            naj = joint.name     
            nap = self.bvh_tree.joint_parent(joint.name)

            if nap is not None:
                pid = self.bvh_tree.get_joint_index(nap.name)
            else:
                pid = -1            
            
            item_dict = {}
            item_dict['id']= jid
            item_dict['pid'] = pid
            item_dict['name'] = joint.name

            self.graph.append(item_dict)
        
            chans = self.bvh_tree.joint_channels(joint.name)

            joint_pos_inds = []
            joint_rot_inds = []
            
            # do position channels
            x_pind = Utils.get_index_of_key(arr=chans, key="Xposition")
            y_pind = Utils.get_index_of_key(arr=chans, key="Yposition")
            z_pind = Utils.get_index_of_key(arr=chans, key="Zposition")         
            
            joint_pos_inds.append(x_pind + self.channel_counter)
            joint_pos_inds.append(y_pind + self.channel_counter)
            joint_pos_inds.append(z_pind + self.channel_counter)

            self.pos_inds.append(joint_pos_inds)
            
            #removes all unmatched indices (-1)
            joint_pos_inds = [x for x in joint_pos_inds if x != -1]

            # do rotation channels

            x_rind = Utils.get_index_of_key(arr=chans, key=order[0])
            y_rind = Utils.get_index_of_key(arr=chans, key=order[1])
            z_rind = Utils.get_index_of_key(arr=chans, key=order[2])   

            joint_rot_inds.append(x_rind + self.channel_counter)
            joint_rot_inds.append(y_rind + self.channel_counter)
            joint_rot_inds.append(z_rind + self.channel_counter)
            
            #removes all unmatched indices (-1)
            joint_rot_inds = [x for x in joint_rot_inds if x != -1]

            self.rot_inds.append(joint_rot_inds)

            self.channel_counter += len(chans)                

    
    def build_graph(self):
        id_map_rev = {}

        id_map_rev[-1] = -1
        counter = 0
        for j in self.graph:
            id_map_rev[j['id']] = counter
            counter += 1
            
        mapped_graph = []
        for j in self.graph:
            mapped_dict = {}
            mapped_id = id_map_rev[j['id']]
            mapped_pid = id_map_rev[j['pid']]
            mapped_dict['id'] = mapped_id
            mapped_dict['pid'] = mapped_pid
            mapped_dict['name'] = j['name']
            mapped_graph.append(mapped_dict)


        self.descriptor["joint-offsets"] = self.offsets
        self.descriptor["joint-rot-cols"] = self.rot_inds
        self.descriptor["joint-pos-cols"] = self.pos_inds
        self.descriptor["joint-graph"] = mapped_graph


    def save_as_numpy(self, filename: str = "new_motion_file"):
        self.dataset = np.array(self.bvh_tree.frames)
        self.framecount = self.dataset.shape[0]
        savePath_npy = Path(f"data/numpy/{filename}")
        savePath_npy.parent.mkdir(parents=True, exist_ok=True)
        np.save(savePath_npy, self.dataset)
