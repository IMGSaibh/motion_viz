import json
from pathlib import Path
import bvhtoolbox
import numpy as np
from backend.utils import Utils


class BvhParser:
    def __init__(self, bvh_text: str, descriptor_file_path: Path):

        with open(descriptor_file_path, "r") as read_desc_file:
            self.desc = json.load(read_desc_file)
            
        self.bvh_tree = bvhtoolbox.BvhTree(bvh_text)
        order = ["Xrotation", "Yrotation", "Zrotation"]  # default order

        if self.desc["rotation-representation"] == "euler_zxy":
            order = ["Zrotation","Xrotation","Yrotation"]

        elif self.desc["rotation-representation"] == "euler_yxz":
            order = ["Yrotation","Xrotation","Zrotation"]
        else:
            print("Rot order in json not def for bvh")
    
        self.bvhtree_to_data(self.bvh_tree, order)
        graph, offs, rot_inds, pos_inds = self.bvhtree_to_data(self.bvh_tree, order)
        # data = self.bvh_tree.frames

        # make indices gapless .e.g. [0,1,3,5,6] to [0,1,2,3,4]

        id_map_rev = {}

        id_map_rev[-1] = -1
        counter = 0
        for j in graph:
            id_map_rev[j['id']] = counter
            counter += 1
            
        mapped_graph = []
        for j in graph:
            mapped_dict = {}
            mapped_id = id_map_rev[j['id']]
            mapped_pid = id_map_rev[j['pid']]
            mapped_dict['id'] = mapped_id
            mapped_dict['pid'] = mapped_pid
            mapped_dict['name'] = j['name']
            mapped_graph.append(mapped_dict)
            a = 0

        ### done

        
        # self.desc.set_attribute("joint-offsets", offs)
        # self.desc.set_attribute("joint-rot-cols", rot_inds)
        # self.desc.set_attribute("joint-pos-cols", pos_inds)

        # #self.desc.joint_graph = mapped_graph
        # self.desc.set_attribute("joint-graph", mapped_graph)

        self.dataset = np.array( self.bvh_tree.frames)

        self.framecount = self.dataset.shape[0]
    
    def bvhtree_to_data(self, bvh_tree, order=["Xrotation","Yrotation","Zrotation"]):

        graph = []
        offsets = []

        rot_inds = []
        pos_inds = []

        channel_counter = 0

        for joint in bvh_tree.get_joints(end_sites=False):      

            offs = bvh_tree.joint_offset(joint.name)
            offsets.append(offs)

            jid = bvh_tree.get_joint_index(joint.name)             

            naj = joint.name     
            nap = bvh_tree.joint_parent(joint.name)

            if nap is not None:
                pid = bvh_tree.get_joint_index(nap.name)
            else:
                pid = -1            
            
            item_dict = {}
            item_dict['id']= jid
            item_dict['pid'] = pid
            item_dict['name'] = joint.name

            graph.append(item_dict)
        
            chans = bvh_tree.joint_channels(joint.name)      

            joint_pos_inds = []
            joint_rot_inds = []
            
            # do position channels
            x_pind = Utils.get_index_of_key(arr=chans, key="Xposition")
            y_pind = Utils.get_index_of_key(arr=chans, key="Yposition")
            z_pind = Utils.get_index_of_key(arr=chans, key="Zposition")         
            
            joint_pos_inds.append(x_pind+channel_counter)
            joint_pos_inds.append(y_pind+channel_counter)
            joint_pos_inds.append(z_pind+channel_counter)

            pos_inds.append(joint_pos_inds)
            
            #removes all unmatched indices (-1)
            joint_pos_inds = [x for x in joint_pos_inds if x != -1]

            # do rotation channels

            x_rind = Utils.get_index_of_key(arr=chans, key=order[0])
            y_rind = Utils.get_index_of_key(arr=chans, key=order[1])
            z_rind = Utils.get_index_of_key(arr=chans, key=order[2])      

            joint_rot_inds.append(x_rind+channel_counter)
            joint_rot_inds.append(y_rind+channel_counter)
            joint_rot_inds.append(z_rind+channel_counter)
            
            #removes all unmatched indices (-1)
            joint_rot_inds = [x for x in joint_rot_inds if x != -1]

            rot_inds.append(joint_rot_inds)

            channel_counter += len(chans)                
            a = 1

        return graph, offsets, rot_inds, pos_inds
    
